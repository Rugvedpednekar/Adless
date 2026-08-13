import json,os,urllib.request
from uuid import uuid4
from datetime import datetime,timezone
from app.schemas.placement_analytics import PlacementAnalyticsSummary,PlacementEvent

class PlacementAnalyticsError(RuntimeError):pass
class PlacementAnalyticsService:
 def __init__(self):
  self.host=os.getenv("CLICKHOUSE_HOST","").rstrip("/");self.user=os.getenv("CLICKHOUSE_USERNAME","");self.password=os.getenv("CLICKHOUSE_PASSWORD","")
 def record(self,event:PlacementEvent):
  if not self.host:raise PlacementAnalyticsError("ClickHouse analytics is not configured")
  row={"event_id":uuid4().hex,"timestamp":datetime.now(timezone.utc).isoformat(),**event.model_dump(mode="json")}
  self._query("INSERT INTO adless.placement_events FORMAT JSONEachRow\n"+json.dumps(row))
 def summary(self)->PlacementAnalyticsSummary:
  if not self.host:return PlacementAnalyticsSummary()
  query="""SELECT countIf(event_type='placement_impression') placement_impressions,countIf(event_type='cta_impression') cta_impressions,countIf(event_type='cta_click') cta_clicks,countIf(event_type='cta_dismiss') cta_dismissals,countIf(event_type='placement_exposure_completed') exposure_completions FROM adless.placement_events FORMAT JSONEachRow"""
  try:
   data=json.loads(self._query(query).splitlines()[0]);impressions=int(data.get("cta_impressions",0));clicks=int(data.get("cta_clicks",0));return PlacementAnalyticsSummary(**data,cta_ctr=(clicks/impressions if impressions else 0))
  except Exception as exc:raise PlacementAnalyticsError("ClickHouse analytics query failed") from exc
 def _query(self,query):
  request=urllib.request.Request(self.host,data=query.encode(),method="POST",headers={"X-ClickHouse-User":self.user,"X-ClickHouse-Key":self.password,"Content-Type":"text/plain"})
  try:
   with urllib.request.urlopen(request,timeout=5) as response:return response.read().decode()
  except Exception as exc:raise PlacementAnalyticsError("ClickHouse analytics request failed") from exc
