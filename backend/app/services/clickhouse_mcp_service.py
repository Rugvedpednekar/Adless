import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from uuid import uuid4

from pydantic import TypeAdapter, ValidationError

from app.schemas.campaign_selection import CampaignCandidate


BACKEND_ROOT = Path(__file__).resolve().parents[2]
MCP_OUTPUT_DIRECTORY = BACKEND_ROOT / "cache" / "clickhouse_mcp"
MCP_OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
SAFE_CONTEXT = re.compile(r"^[a-z0-9_ -]+$", re.IGNORECASE)


class ClickHouseMCPError(RuntimeError):
    pass


class NoCompatibleCampaignsError(ClickHouseMCPError):
    pass


class ClickHouseMCPService:
    def query_campaigns(
        self,
        *,
        market: str,
        environment: str,
        placement_surface: str,
        categories: list[str],
    ) -> tuple[list[CampaignCandidate], str]:
        values = [market, environment, placement_surface, *categories]
        if not categories or any(not SAFE_CONTEXT.fullmatch(value) for value in values):
            raise ClickHouseMCPError("Placement context contains unsupported query values")

        quote = lambda value: "'" + value.replace("'", "''") + "'"
        category_list = ", ".join(quote(category.lower()) for category in categories)
        query = f"""SELECT
    campaign_id,
    brand,
    product_name,
    category,
    impressions,
    avg_exposure_seconds,
    success_rate,
    performance_score
FROM adless.campaign_performance
WHERE market = {quote(market.upper())}
  AND scene_environment = {quote(environment.lower())}
  AND placement_surface = {quote(placement_surface.lower())}
  AND category IN ({category_list})
ORDER BY performance_score DESC
LIMIT 5"""

        output_path = MCP_OUTPUT_DIRECTORY / f"campaigns-{uuid4().hex}.json"
        try:
            result = subprocess.run(
                [
                    str(self._resolve_codex_cli()),
                    "exec",
                    "--ephemeral",
                    "--sandbox",
                    "read-only",
                    "-C",
                    str(BACKEND_ROOT.parent),
                    "-o",
                    str(output_path),
                    self._mcp_prompt(query),
                ],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
            if result.returncode != 0 or not output_path.exists():
                raise ClickHouseMCPError("ClickHouse MCP campaign query failed")
            payload = self._extract_json(output_path.read_text(encoding="utf-8"))
            candidates = TypeAdapter(list[CampaignCandidate]).validate_python(payload)
            if not candidates:
                raise NoCompatibleCampaignsError("No compatible campaigns were found")
            return candidates, query
        except subprocess.TimeoutExpired as exc:
            raise ClickHouseMCPError("ClickHouse MCP campaign query timed out") from exc
        except (OSError, ValidationError, ValueError, json.JSONDecodeError) as exc:
            raise ClickHouseMCPError("ClickHouse MCP returned malformed campaign data") from exc
        finally:
            output_path.unlink(missing_ok=True)

    def _resolve_codex_cli(self) -> Path:
        configured = os.getenv("CODEX_CLI_PATH")
        if configured and Path(configured).is_file():
            return Path(configured)
        local_bin = Path(os.environ.get("LOCALAPPDATA", "")) / "OpenAI" / "Codex" / "bin"
        matches = sorted(local_bin.glob("*/codex.exe"), key=lambda path: path.stat().st_mtime, reverse=True)
        if matches:
            return matches[0]
        located = shutil.which("codex")
        if located:
            return Path(located)
        raise ClickHouseMCPError("Codex MCP client is not available")

    def _mcp_prompt(self, query: str) -> str:
        return (
            "Use only the configured clickhouse-cloud MCP server. First use get_organizations and "
            "get_services_list to resolve the ClickHouse Cloud serviceId, then use run_select_query. "
            "Run exactly the following read-only SELECT query. Do not modify data or files. "
            "Return only a JSON array of row objects with no markdown or explanation. Query:\n" + query
        )

    def _extract_json(self, value: str):
        stripped = value.strip()
        if stripped.startswith("```"):
            stripped = re.sub(r"^```(?:json)?\s*|\s*```$", "", stripped, flags=re.IGNORECASE)
        return json.loads(stripped)
