# Adless — Project Update Log

This document is the running development record for **Adless**. It tracks what has actually been built, changed, tested, and deferred. New entries must be added in reverse chronological order; previous entries must not be deleted.

## Update Rules

1. Do not delete previous updates.
2. Add the newest update first.
3. Record only work that was actually implemented.
4. Mark work as Planned, In Progress, Completed, or Blocked.
5. Include affected files, dependencies, tests, known issues, and the next step.
6. Do not update `PROJECT_BLUEPRINT.md` merely to record implementation progress.

## Current Project Status

- **Project:** Adless
- **Type:** AI-native creator video platform
- **Hackathon:** Google Cloud Agentic AI / Partner Track
- **Partner:** ClickHouse
- **Primary AI:** Gemini
- **Google Cloud project:** `adless-ai-2026`
- **Current phase:** Placement QA Agent (real rendered-frame Gemini review verified)

## Updates

## 2026-08-12 — Functional Viewer Library and Profile

### Status

🟢 **Completed**

Added working Explore, Profile, Watch History, Watch Later, and Liked Videos routes. Removed the viewer Subscriptions and Notifications controls. The profile avatar now opens an account menu with profile details and working navigation. Opening a video records it in history; Like and Save update persistent browser-backed viewer lists and their dedicated pages. Share copies the current watch URL. The existing catalog and playback APIs remain unchanged.

Verification: production build passed with 14 routes; browser navigation passed for all five new pages; profile menu opened correctly; Like, Save, and History each persisted the selected `gaming-room-tour` video; no browser console errors were observed.

## 2026-08-12 — Lovable Design Migration

### Status

🟢 **Completed**

### Summary

Migrated the finished Lovable visual design from `D:\Rugved\adless-studio-frontend-main` into the real Next.js frontend while retaining the Adless frontend as the functional source of truth. TanStack Router, Lovable runtime packages, mock catalogs, mock workflow timers, and Lovable-only backend concepts were not copied. The existing Next.js routes, `video-service.ts`, typed models, FastAPI contracts, real GCS upload/playback, Gemini analysis, ClickHouse MCP campaign selection, placement rendering, Gemini QA, and creator review state remain in use.

### Lovable Design Elements Reused

- Semantic cinematic dark palette and restrained Adless teal accent
- Original Adless SVG mark and typography hierarchy
- Viewer header, search, sidebar grouping, mobile navigation, and creator message card
- Video-card hover treatment, play affordance, rounded thumbnails, and discovery sections
- Studio header/sidebar structure, greeting, metric cards, content tables, and responsive spacing
- Five-step workflow cards, campaign intelligence presentation, Before/After treatment, QA presentation, and separate dashed creator-approval panel

### Architecture Decisions

- Kept Next.js 14, React 18, and Tailwind CSS 3; did not import the Lovable TanStack Start, React 19, Tailwind 4, Radix, or mock-data architecture.
- Added no Supabase, Firebase, authentication backend, Edge Functions, databases, or third-party AI providers.
- Preserved all required URLs and backend endpoints.
- Split creator approval into a reusable component so Gemini approval remains visibly and functionally separate.

### Verification

- Frontend production build: **passed** — compilation, lint, TypeScript, and all 9 generated routes.
- Backend regression suite: **33 passed**.
- Browser route checks: homepage, watch/playback, recommendations, Studio dashboard, content, upload, analytics, placements, and video detail passed.
- Responsive checks: homepage and Studio workflow passed at 390 × 844 with no horizontal overflow.
- Real demo workflow for `original-living-room-ai-demo-dbfa4523`: Gemini analysis returned the living-room coffee-table opportunity; the real ClickHouse-backed endpoint selected CrunchPop with performance 8.8, 91% success, 6.8-second exposure, and 95% Gemini confidence; the rendered Before/After preview loaded; real Gemini QA returned Needs Adjustment at 75% due to an insufficient contact shadow; Creator Approval remained a separate manual action.
- Browser console errors: none.
- Credentials or new secret-bearing files introduced: none.
- `PROJECT_BLUEPRINT.md`: unchanged.

### Remaining Limitation

The real QA result correctly identified the current rendered CrunchPop preview’s weak contact shadow. Regeneration remains creator-triggered and is not an autonomous repair loop.

## 2026-08-12 — Frontend Reconstruction

### Status

🟢 **Completed**

### Summary

Reconstructed the Adless frontend as a polished, responsive video platform while preserving the existing backend contracts and creator AI pipeline. The viewer experience now uses a fixed YouTube-style header, collapsible desktop navigation, mobile bottom navigation, category filters, borderless video cards, a dominant watch player, and an Up Next rail. AI controls were removed from viewer pages and consolidated in Creator Studio.

Creator Studio now has a separate application shell with Dashboard, Content, Upload, Analytics, AI Placements, and video-detail routes. The video detail page presents the existing Gemini analysis → ClickHouse campaign selection → placement preview → Gemini visual QA → separate creator approval flow as a clear five-stage workflow. Existing upload, thumbnail extraction, playback, private GCS preview, and API service functions were preserved.

### Routes Added or Rebuilt

- `/`
- `/watch/{video_id}`
- `/studio`
- `/studio/content`
- `/studio/upload`
- `/studio/analytics`
- `/studio/placements`
- `/studio/videos/{video_id}`

### Verification

- Frontend production build: **passed** (9 routes, lint and TypeScript checks included).
- Backend regression suite: **33 passed**.
- Browser verification: homepage catalog, local video playback, Up Next rail, all Studio routes, cached Gemini analysis, and responsive 390px layouts passed.
- Mobile horizontal overflow: none observed.
- Browser console errors: none observed. The initial Next.js LCP thumbnail warning was addressed with priority loading for the first card.
- Real campaign selection was initiated through the existing UI, but the external ClickHouse MCP request remained pending during this verification window; no result was fabricated and the UI retained an honest loading state.
- `PROJECT_BLUEPRINT.md`: unchanged.

### Files

Created navigation shells, Studio workflow components, recommended-video/player components, and Studio Content, Analytics, and Placements routes. Rebuilt the existing homepage, watch page, Studio dashboard, upload page, Studio video detail page, shared theme, video cards/grid/thumbnails, categories, and frontend types.

### Next Step

Creator review of the completed frontend and a follow-up live MCP workflow check when the remote service responds normally.

## 2026-08-12 — Placement QA Agent

### Status

🟢 **Completed**

### Phase

Private rendered preview → representative frame → Gemini Vision QA → validated quality result → separate Creator Approval

### Summary

Implemented the first Adless Placement QA Agent without changing the existing scene analysis, ClickHouse MCP campaign selection, placement localization, rendering, private GCS, or Before/After workflow. The agent downloads the actual rendered preview, extracts a representative JPEG from the midpoint of the placement interval with FFmpeg, sends that real frame plus placement/campaign context to Vertex Gemini, and validates the structured response with Pydantic. Gemini approval never publishes or performs creator approval.

### API Added

```text
POST /api/videos/{video_id}/placements/{placement_index}/qa
```

The endpoint requires an existing video analysis, valid placement, rendered preview, and selected campaign. Missing prerequisites return safe 404/409 responses; Gemini, extraction, storage, and malformed-response failures return HTTP 502 without fabricated QA.

### Real Gemini Visual QA

```text
video: original-living-room-ai-demo-dbfa4523
campaign: camp_001 / CrunchPop Classic Chips
preview: gs://adless-media-2026/previews/original-living-room-ai-demo-dbfa4523/0/preview.mp4
representative frame: 2.5 seconds
approved: true
quality score: 0.90
```

Validated checks:

- Surface alignment, scale, position, perspective, visibility, category fit, and scene safety: pass.
- Face, subtitle, important-object, and mug obstruction/intersection: none.
- Product floating or excessive prominence: none.
- Contact shadow: needs improvement.

Actual issue:

```text
Contact shadow is weak, making the product appear slightly less grounded.
```

Actual Gemini explanation:

```text
The product is well-integrated into the scene with appropriate scale, position, and perspective. The context is suitable, and there are no obstructions or safety concerns. The contact shadow could be more pronounced for enhanced realism.
```

### Creator Studio

- Added explicit `Run AI Quality Check` / `Run Again` control after preview creation.
- Displays overall Approved or Needs Adjustment state and quality percentage.
- Displays concise status indicators for alignment, scale, position, perspective, contact shadow, visibility, face/subtitle/object/mug obstruction, floating, prominence, context, and safety.
- Displays issues, Gemini reasoning, and representative frame timestamp.
- Labels `Creator Approval · Separate from AI review` above Approve, Regenerate Placement, and Reject.
- AI approval does not trigger creator approval or publishing.
- Both Before/After videos remained at browser ready state 4 with no media error.

### Files Created

```text
backend/app/agents/placement_qa_agent.py
backend/app/schemas/placement_qa.py
backend/tests/test_placement_qa.py
```

### Files Modified

```text
backend/app/api/videos.py
frontend/app/studio/videos/[videoId]/page.tsx
frontend/services/video-service.ts
frontend/types/index.ts
PROJECT_UPDATE.md
```

### Verification

```text
backend: 33 passed
frontend: production build passed (compile, lint, type checks, 6 routes)
real rendered preview frame sent to Vertex Gemini: passed
Pydantic QA validation: passed
malformed Gemini response rejection: covered
real mug-intersection assessment: false
ClickHouse MCP retry and CrunchPop selection: passed, score 8.8
Before/After playback regression: passed
Creator Studio QA rendering: passed
```

### Known Limitations

- QA inspects one representative frame for this static-camera MVP, not every frame in the interval.
- The contact shadow remains visually subtle and was correctly flagged by Gemini.
- QA results are not persisted and do not initiate automatic regeneration.
- Creator decisions remain session-only; no PostgreSQL, publishing, job queue, or tracking was added.

### Next Step

Stop after this verified QA milestone. Do not begin autonomous regeneration, publishing, analytics events, PostgreSQL, or advertiser workflows automatically.

## 2026-08-12 — First Product Placement Preview

### Status

🟢 **Completed**

### Phase

Selected campaign → Gemini frame localization → FFmpeg compositing → private GCS preview → Creator review

### Summary

Implemented the first real Adless product-placement preview for the original six-second static-camera living-room demo and fictional CrunchPop campaign. The existing Gemini scene-analysis and ClickHouse MCP campaign-selection workflow remains unchanged. A successful campaign selection is cached locally, the preview endpoint extracts a representative frame, Gemini Vision returns validated normalized geometry, OpenCV builds a transparent product overlay with a subtle contact shadow, FFmpeg renders it only during the detected interval while preserving source audio when present, and the final MP4 is uploaded to the private Adless GCS bucket.

### Product Asset

```text
backend/product-assets/crunchpop.png
campaign_id: camp_001
brand: CrunchPop
product: CrunchPop Classic Chips
category: snack
```

The wholly fictional asset was generated as a product mockup on chroma green, converted locally to RGBA, and validated with transparent corners. No real brand or commercial logo is used.

### API Added

```text
POST /api/videos/{video_id}/placements/{placement_index}/preview
POST /api/videos/{video_id}/placements/{placement_index}/preview?force=true
GET  /api/videos/{video_id}/placements/{placement_index}/preview/stream
```

Preview creation requires a previously selected campaign and handles missing videos, analysis, placement, selected campaign, product assets, malformed Gemini geometry, FFmpeg failures, and GCS failures without fabricating output.

### Real Localization Result

```json
{
  "surface": "coffee_table",
  "x": 0.38,
  "y": 0.45,
  "width": 0.18,
  "height": 0.22,
  "rotation": 0.0,
  "confidence": 0.90,
  "reason": "Placed a CrunchPop Classic Chips snack bag on the unoccupied left-center portion of the coffee table, away from the existing mug and table edges, at a realistic scale and orientation."
}
```

Coordinates came from real Gemini analysis of the extracted midpoint frame and are not hard-coded. Visual inspection confirmed that CrunchPop is grounded on the open center-left table surface without overlapping the mug.

### Rendering Operations

- Downloaded the private original MP4 to a temporary processing directory.
- Extracted the representative frame at `2.5s` using bundled FFmpeg 7.1.
- Converted normalized geometry to `1280×720` frame pixels.
- Used OpenCV to resize the RGBA asset and construct a soft alpha contact shadow.
- Alpha-composited a full-frame transparent overlay.
- Used FFmpeg's timed `overlay` filter for `00:00–00:05`.
- Encoded H.264 High Profile, `yuv420p`, 1280×720, preserving source audio with `-map 0:a? -c:a copy` when present.
- Cleaned the temporary source, frame, overlay, and rendered file automatically.

The original verification demo has no audio stream; both source and preview are exactly six seconds. The renderer's optional audio mapping and stream copy preserve audio for sources that contain it.

### GCS and Playback Verification

```text
gs://adless-media-2026/previews/original-living-room-ai-demo-dbfa4523/0/preview.mp4
```

- Bucket remains private.
- Protected FastAPI preview stream returned HTTP 206 with `Content-Range: bytes 0-1023/1115811`.
- Browser loaded both original and preview to `readyState 4` with no media error.
- No Google credentials are exposed to frontend code.

### Creator Studio

- Added `Preview Placement` after campaign selection.
- Added honest processing stages without a fake percentage.
- Added Before/After video players.
- Displays product, surface, timestamps, localization confidence, ClickHouse score, and Gemini reasoning.
- Added session-only Approve, Regenerate, and Reject actions.
- Approval interaction verified.
- Browser console errors: none.

### Files Created

```text
backend/product-assets/crunchpop.png
backend/app/schemas/placement_preview.py
backend/app/services/campaign_selection_cache.py
backend/app/services/placement_localization_service.py
backend/app/services/product_catalog.py
backend/app/services/product_placement_service.py
backend/tests/test_product_placement.py
```

### Files Modified

```text
.gitignore
backend/app/api/videos.py
backend/app/services/storage_service.py
backend/requirements.txt
frontend/app/studio/videos/[videoId]/page.tsx
frontend/services/video-service.ts
frontend/types/index.ts
PROJECT_UPDATE.md
```

### Verification

```text
backend: 27 passed
frontend: production build passed (compile, lint, type checks, 6 routes)
real Gemini localization: passed
real ClickHouse MCP + Gemini campaign reselection: CrunchPop, score 8.8
real FFmpeg render: passed
private GCS upload: passed
protected range playback: passed
Before/After Studio UI: passed
browser console errors: none
```

### Known Limitations

- Static positioning is intentionally limited to the verified static-camera demo; no tracking is implemented.
- Perspective matching is limited to scale, rotation, alpha blending, and contact shadow.
- Campaign selections, previews, and review decisions use local development caches/session state rather than PostgreSQL.
- Rendering runs synchronously in the request and is not production-scale job processing.
- The original verification source contains no audio track, so audio preservation was validated structurally rather than with audible content.

### Next Step

Stop after this verified preview milestone. Do not begin QA agents, publishing, advertiser features, PostgreSQL, or production video processing automatically.

## 2026-08-12 — Campaign Selection Agent with ClickHouse MCP

### Status

🟢 **Completed**

### Phase

Gemini placement opportunity → ClickHouse MCP analytics → Gemini campaign decision

### Summary

Implemented the first Adless Campaign Selection Agent. The backend resolves a previously cached Gemini placement opportunity, dynamically builds a read-only ClickHouse query from its market, environment, surface, and recommended categories, executes the query exclusively through the official ClickHouse Cloud Remote MCP OAuth connection, and passes the validated candidates to Vertex Gemini for a structured final selection. No direct ClickHouse database client or database credential was added.

### Runtime Architecture

```text
Cached Gemini VideoAnalysis
→ indexed placement opportunity
→ ClickHouse Cloud MCP get_organizations
→ ClickHouse Cloud MCP get_services_list
→ ClickHouse Cloud MCP run_select_query
→ validated CampaignCandidate list
→ Vertex Gemini gemini-2.5-flash
→ validated SelectedCampaign
```

The current local-development MCP bridge uses the installed Codex MCP client and its existing OAuth session. OAuth tokens remain in the MCP client credential store and are never exposed to FastAPI, the browser, application code, or Git.

### API Added

```text
POST /api/videos/{video_id}/placements/{placement_index}/select-campaign
Body: {"market":"US"}
```

The market defaults to `US`. The endpoint handles missing videos, missing cached analysis, invalid placement indexes, no candidates, MCP failures, and malformed Gemini output.

### Real Gemini Placement Context

The original licensed living-room video was force-refreshed with stricter semantic labels:

```text
video_id: original-living-room-ai-demo-dbfa4523
environment: living_room
surface: coffee_table
categories: beverage, snack, book, home_decor
placement confidence: 0.95
```

### Actual MCP Query

```sql
SELECT
    campaign_id,
    brand,
    product_name,
    category,
    impressions,
    avg_exposure_seconds,
    success_rate,
    performance_score
FROM adless.campaign_performance
WHERE market = 'US'
  AND scene_environment = 'living_room'
  AND placement_surface = 'coffee_table'
  AND category IN ('beverage', 'snack', 'book', 'home_decor')
ORDER BY performance_score DESC
LIMIT 5
```

### Real Candidates Returned

| Campaign | Brand / Product | Category | Impressions | Exposure | Success | Score |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| `camp_001` | CrunchPop / CrunchPop Classic Chips | snack | 12,500 | 6.8s | 0.91 | 8.8 |
| `camp_002` | Nova Cola / Nova Cola Original | beverage | 9,300 | 6.2s | 0.86 | 7.6 |

### Real Gemini Selection

```text
campaign: camp_001
brand: CrunchPop
product: CrunchPop Classic Chips
category: snack
market: US
surface: coffee_table
performance score: 8.8
success rate: 0.91
average exposure: 6.8 seconds
selection confidence: 0.95
```

Gemini selected CrunchPop because the snack category is compatible with the living-room coffee-table opportunity and it leads Nova Cola across performance score, historical success rate, and average exposure duration. Candidate facts are overwritten from the validated ClickHouse row after selection so Gemini cannot alter analytics values.

### Creator Studio

- Added `Find Best Campaign` to every placement opportunity.
- Added per-placement loading, retry, error, and selected states.
- Displays fictional brand, product, category, market, performance score, success rate, exposure, Gemini confidence, and reasoning.
- Displays `Campaign intelligence powered by ClickHouse`.
- Browser console errors during real verification: **none**.

### MCP Tools Used

```text
clickhouse-cloud/get_organizations
clickhouse-cloud/get_services_list
clickhouse-cloud/run_select_query
```

### Files Created

```text
backend/app/agents/__init__.py
backend/app/agents/campaign_selector.py
backend/app/schemas/campaign_selection.py
backend/app/services/clickhouse_mcp_service.py
backend/tests/test_campaign_selection.py
```

### Files Modified

```text
.gitignore
backend/app/api/videos.py
backend/app/services/gemini_video_analyzer.py
frontend/app/studio/videos/[videoId]/page.tsx
frontend/services/video-service.ts
frontend/types/index.ts
PROJECT_UPDATE.md
```

### Verification

```text
backend: python -m pytest -q
PASS — 22 passed, 2 non-fatal environment/library warnings

frontend: npm run build
PASS — production compile, lint, type checks, and all 6 routes
```

- Real ClickHouse MCP execution: **PASS**.
- Candidate Pydantic validation: **PASS**.
- Real Vertex Gemini campaign decision: **PASS**.
- Selected campaign rendered in Creator Studio: **PASS**.
- Browser console errors: **none**.
- No ClickHouse credentials or OAuth tokens tracked by Git: **PASS**.

### Limitations

- The MCP bridge is a local-development integration that depends on the installed Codex MCP client and its OAuth session. A deployed Cloud Run version will need a managed non-interactive MCP OAuth strategy appropriate to its runtime identity.
- Campaign selections are not persisted; refreshing the page clears the displayed selection.
- No campaign reservation, budget, advertiser workflow, compositing, rendering, or product generation is included.

### Next Step

Stop after this verified milestone. Do not begin product rendering, advertiser features, PostgreSQL, or payments automatically.

## 2026-08-12 — Gemini Video Intelligence on Vertex AI

### Status

🟢 **Completed**

### Phase

Video → Gemini → structured scene-level product-placement opportunities

### Summary

Replaced the API-key/local-file Gemini prototype with a real Vertex AI workflow using the current `google-genai` SDK, Application Default Credentials, and private GCS video URIs. Uploaded videos can now be analyzed into a validated summary and chronological scene timeline containing timestamps, environment, mood, objects, safe placement surfaces, generic product categories, confidence, and reasoning. Creator Studio now provides a dedicated video detail route with polished ready, processing, success, empty-opportunity, retry, and force-refresh states.

### Google Cloud Configuration

```text
Project: adless-ai-2026
Location: global
Model: gemini-2.5-flash
SDK: google-genai 2.10.0
Authentication: Application Default Credentials
Input: private gs:// URI via Part.from_uri
API version: v1
```

Enabled `aiplatform.googleapis.com` for the project because the first real call returned `SERVICE_DISABLED`. Google provisioned the Vertex AI service agent, after which Gemini successfully read the private GCS object.

### API and Schema

```text
POST /api/videos/{video_id}/analyze
POST /api/videos/{video_id}/analyze?force=true
```

- GCS-uploaded catalog entries are accepted.
- Unknown IDs return HTTP 404.
- Local-only demo videos return HTTP 422 rather than being uploaded implicitly.
- Responses are constrained with `response_mime_type=application/json` and the Pydantic `VideoAnalysis` response schema.
- Invalid structured output is rejected with HTTP 502 and is never cached.
- Successful results are cached by video ID, GCS URI, schema version, and model.

### Real Licensed Verification

Created a wholly original, brand-free synthetic living-room scene and encoded a six-second verification MP4 outside the application pipeline. The asset and temporary encoding tools remain in Git-ignored verification folders.

```text
Video ID: original-living-room-ai-demo-dbfa4523
GCS URI: gs://adless-media-2026/videos/original-living-room-ai-demo-dbfa4523/original-living-room.mp4
Size: 4,156,218 bytes
```

Real Gemini result:

- Summary: cozy minimalist living room with sofa, coffee table, mug, rug, plant, and floor lamp.
- Scene: `00:00–00:05`, `living_room`, `calm_cozy`.
- Objects: coffee table, sofa, pillows, blanket, mug, rug, plant, floor lamp, framed art, and window.
- Placement: wooden coffee-table surface.
- Recommended categories: books, magazines, decorative vases, small sculptures, coasters, remote controls, and table games.
- Confidence: `0.95`.
- Structured Pydantic validation: **PASS**.

### Creator Studio Verification

- Added `/studio/videos/[videoId]` and linked Studio catalog rows to it.
- `Analyze with Adless AI` invokes the FastAPI endpoint.
- Processing state contains no fake percentage.
- Summary, scenes, timestamps, objects, categories, confidence, and reasoning render as user-facing cards rather than raw JSON.
- Force-refresh is available through `Analyze again`.
- Fresh browser-tab console errors: **none**.

### Automated and Runtime Verification

```text
backend: python -m pytest -q
PASS — 16 passed, 3 non-fatal dependency/environment warnings

frontend: npm run build
PASS — compile, lint, type checks, and 6 routes including the new Studio detail route
```

- Real Vertex AI Gemini call: **PASS**.
- Private uploaded-video byte range: **PASS** — HTTP 206 and 1,024 bytes returned.
- Existing local video catalog detail: **PASS** — HTTP 200.
- Original verification video appears in catalog: **PASS**.
- Existing upload and playback API tests: **PASS**.

### Approximate Cost

Vertex `count_tokens` reported 1,813 input tokens. At Gemini 2.5 Flash standard rates of $0.30 per million input video/text tokens and $2.50 per million output text tokens, the verified request is approximately **$0.001–$0.002**, depending on final billable output/reasoning tokens. This excludes the earlier failed setup requests, which did not produce model output.

### Files Created

```text
frontend/app/studio/videos/[videoId]/page.tsx
backend/.verification-assets/* (ignored runtime verification artifacts)
backend/.verification-tools/* (ignored temporary verification dependencies)
```

### Files Modified

```text
.env.example
.gitignore
backend/.env (ignored)
backend/app/api/videos.py
backend/app/core/config.py
backend/app/schemas/video_analysis.py
backend/app/services/gemini_video_analyzer.py
backend/tests/test_video_analysis.py
frontend/app/studio/page.tsx
frontend/app/watch/[videoId]/page.tsx
frontend/services/video-service.ts
frontend/types/index.ts
PROJECT_UPDATE.md
```

### Important Decisions and Limitations

- No API key is used; credentials stay server-side through ADC.
- No deprecated `vertexai.generative_models` module is used.
- No ClickHouse, MCP, PostgreSQL, campaign selection, advertiser portal, product generation, or compositing was added.
- Current cache is local development JSON, not a durable production store.
- Analysis accepts uploaded GCS videos only; the three legacy local demos remain playable but intentionally cannot invoke Vertex analysis.
- Scene timestamps are model estimates and should be treated as analysis metadata, not frame-accurate edit points.

### Next Step

Stop after this verified milestone. Do not begin campaign selection, ClickHouse, product generation, or compositing automatically.

## 2026-08-12 — Private GCS Creator Upload Verified

### Status

🟢 **Completed**

### Phase

Incremental cloud-storage integration for Creator Studio uploads

### Summary

Configured the local backend for project `adless-ai-2026` and private bucket `adless-media-2026`, updated creator uploads to the requested `videos/{video_id}/{filename}` object layout, and verified a real 30,632,266-byte MP4 upload through `/studio/upload`. The new item appears alongside the three unchanged local demos in the catalog and has a private, credential-free FastAPI byte-range playback URL.

### Configuration and Implementation

- Added the ignored local `backend/.env` with `GOOGLE_CLOUD_PROJECT` and `GCS_BUCKET`.
- Added explicit backend `.env` loading through `python-dotenv`.
- Added sanitized original-filename handling for `videos/{video_id}/{filename}`.
- Continued to use Application Default Credentials only on the backend.
- Kept the bucket private with no browser-visible Google credentials.

### Live Verification

- Bucket access and location: **PASS** — `adless-media-2026`, `US-EAST1`.
- Studio upload: **PASS** — `GCS Upload Verification` returned to the homepage.
- GCS object: **PASS** — `gs://adless-media-2026/videos/gcs-upload-verification-701335a1/Friends-Joey-s-Bad-Birthday-Gift-Season-4-Clip-TBS---TBS-1080p-.mp4`.
- Catalog: **PASS** — four videos total, including all three original local demo IDs.
- Private playback proxy: **PASS** — HTTP `206`, `Content-Range: bytes 0-1023/30632266`, 1,024 bytes returned as `video/mp4`.
- Homepage: **PASS** — uploaded item appears first and links to `/watch/gcs-upload-verification-701335a1`.
- Uploaded watch-page metadata: **PASS**.
- Local demo watch-page metadata: **PASS**.
- Embedded verification browser MP4 decode: **LIMITATION** — its codec runtime reports the same media error for both the uploaded object and the unchanged local MP4; API byte-range playback was independently validated and the servers remain available for verification in a normal browser.

### Automated Verification

```text
backend: python -m pytest -q
PASS — 15 passed, 2 non-fatal warnings

frontend: npm run build
PASS — production compilation, lint/type checks, and all 5 routes succeeded
```

### Files Modified in This Follow-up

```text
backend/.env (local, ignored)
backend/app/api/videos.py
backend/app/core/config.py
backend/app/services/storage_service.py
backend/requirements.txt
backend/tests/test_videos.py
PROJECT_UPDATE.md
```

### Security Verification

- `backend/.env`, runtime logs, and `backend/data/video_catalog.json` are ignored by Git.
- No credential or service-account file is tracked.
- The frontend receives the FastAPI `/api/videos/{video_id}/stream` URL rather than a GCS credential or public object URL.

## 2026-08-12 — Google Cloud Storage Video Upload Implementation

### Status

🟡 **In Progress — live GCS verification blocked on missing configuration and credentials**

### Phase

Incremental cloud-storage integration for Creator Studio uploads

### Summary

Replaced permanent backend-filesystem storage for new Creator Studio uploads with Google Cloud Storage using Google's official Python client. FastAPI now streams the incoming upload directly to a unique private GCS object, stores the `gs://` reference in local development metadata, and exposes a credential-free backend playback proxy with HTTP byte-range support. The three bundled local videos remain unchanged.

The current machine has no `GCS_BUCKET`, Application Default Credentials, `GOOGLE_APPLICATION_CREDENTIALS`, or `gcloud` installation. Therefore a real object could not be uploaded or listed in project `adless-ai-2026`. The endpoint correctly returns HTTP 503 instead of falling back to local storage.

### Features Added

- Isolated `GCSStorageService`
- Official `google-cloud-storage` client with Application Default Credentials
- Direct file-stream upload without permanent backend MP4 copies
- Unique `originals/{video_id}.mp4` object names
- Upload precondition preventing accidental object overwrite
- Upload checksum verification through the client library
- `gs://bucket/object` reference stored in catalog metadata
- Private backend playback endpoint with HTTP 200/206 responses
- Single-range parsing and `Content-Range`/`Accept-Ranges` headers
- GCS cleanup attempt if metadata persistence fails after object upload
- Clear configuration and cloud-operation errors
- Credential-file and local metadata ignore rules

### Files Created

```text
backend/app/services/storage_service.py
```

### Files Modified

```text
.env.example
.gitignore
backend/app/api/videos.py
backend/app/core/config.py
backend/app/main.py
backend/app/schemas/video.py
backend/app/services/video_catalog.py
backend/requirements.txt
backend/tests/test_videos.py
frontend/services/video-service.ts
PROJECT_UPDATE.md
```

### Dependency Added

```text
google-cloud-storage>=3.0.0
```

Installed verification version: `3.13.1`.

### Environment Variables

```text
GOOGLE_CLOUD_PROJECT=adless-ai-2026
GCS_BUCKET=
```

Authentication uses Google Application Default Credentials. No credential value or JSON content is stored in application code or frontend code.

### API Changes

```text
POST /api/videos/upload
GET  /api/videos/{video_id}/stream
```

`POST /api/videos/upload` now requires valid GCS configuration and no longer writes permanent MP4s under `backend/uploads/videos`.

### Tests Performed

```text
cd backend
python -m pytest
```

Result: **PASS** — 15 tests passed. GCS upload, metadata registration, byte-range playback, cloud failure behavior, missing configuration, local catalog routes, Gemini mocks, and health are covered without requiring live cloud access. Two non-fatal environment/library warnings remain.

```text
cd frontend
npm run build
```

Result: **PASS** — production compilation, linting, type checking, and route generation completed successfully.

### Runtime Verification

- All three existing local watch pages loaded their original MP4 sources: **PASS**
- No existing player displayed a media error: **PASS**
- Homepage displayed exactly three videos: **PASS**
- All three automatic thumbnails continued to generate: **PASS**
- Studio upload displayed `GCS_BUCKET is not configured` and remained retryable: **PASS**
- Failed cloud configuration did not add a catalog item or save a local MP4: **PASS**
- Browser console errors: **none**
- Real GCS object upload/list/playback: **BLOCKED — bucket name and ADC are unavailable**

### Security Verification

- Service-account-style JSON filenames are ignored.
- `backend/credentials/` and ADC credential filenames are ignored.
- Browser receives only the backend `/api/videos/{id}/stream` URL, never Google credentials.
- No cloud credentials were added to frontend source or tracked files.

### Important Decisions

- GCS objects remain private; FastAPI mediates playback using server-side ADC.
- Local development metadata remains an ignored JSON catalog until PostgreSQL is introduced in its approved phase.
- Existing local demo videos are not migrated.
- No local-storage fallback is used when GCS fails, ensuring new uploads cannot silently violate this phase's storage requirement.
- Existing Gemini code was not extended or invoked as part of this storage-only change.

### Known Issues / Blocker

- A bucket must exist and be supplied through `GCS_BUCKET`.
- ADC must be configured with object create/get permissions for that bucket.
- Live upload, Cloud Console object verification, and real GCS watch playback remain unverified until those prerequisites are available.
- The backend playback proxy is safe for development but is not a production CDN or high-scale streaming layer.

### Next Step

Configure ADC and `GCS_BUCKET`, restart FastAPI, then upload one small MP4 through Studio and verify the object, catalog entry, and watch playback. Stop after that verification; do not automatically continue to Gemini.

---

## 2026-08-12 — Gemini Video Scene Analysis Implementation

### Status

🟡 **In Progress — real analysis blocked on missing `GEMINI_API_KEY`**

### Phase

Phase 3 — Gemini-powered video understanding

### Summary

Implemented the production-shaped Gemini scene-analysis path for local videos using Google's official Gen AI SDK. The backend uploads the selected MP4 through the Gemini Files API, requests typed structured output, validates it with Pydantic, caches successful results by video fingerprint, and returns only validated analysis. The existing watch-page button now drives polished ready, loading, success, empty-opportunity, and retryable failure states. No fake successful analysis is returned when Gemini is unavailable.

The environment does not currently provide `GEMINI_API_KEY`, so a real model request and real placement recommendation could not be completed in this session. The API correctly returns HTTP 503 and the frontend displays the failure with a retry action.

### Features Added

- `POST /api/videos/{video_id}/analyze`
- Official `google-genai` SDK integration
- Configurable Gemini model and file-processing timeout
- Gemini Files API upload and processing-state polling
- Structured JSON response using a Pydantic response schema
- Confidence validation from `0.0` to `1.0`
- Placement time-range validation
- Catalog-based local MP4 path resolution
- SHA-256 cache key based on video ID, file size, modification time, and model
- Ignored local JSON analysis cache
- `?force=true` option for fresh analysis
- Safe HTTP 404, 502, and 503 failure behavior
- Frontend ready, loading, success, no-opportunity, and failure states
- Human-readable scene facts, objects, placement cards, confidence, products, time range, and reasoning

### Files Created

```text
backend/app/schemas/video_analysis.py
backend/app/services/gemini_video_analyzer.py
backend/tests/test_video_analysis.py
```

### Files Modified

```text
.env.example
.gitignore
backend/app/api/videos.py
backend/app/core/config.py
backend/app/services/video_catalog.py
backend/requirements.txt
frontend/app/watch/[videoId]/page.tsx
frontend/services/video-service.ts
frontend/types/index.ts
PROJECT_UPDATE.md
```

### Dependency Added

```text
google-genai>=1.0.0
```

### Environment Variables

```text
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FILE_TIMEOUT_SECONDS=300
```

### API Changes

```text
POST /api/videos/{video_id}/analyze
POST /api/videos/{video_id}/analyze?force=true
```

### Tests Performed

```text
cd backend
python -m pytest
```

Result: **PASS** — 12 tests passed. Tests cover unknown videos, mocked valid analysis, service failure, missing configuration, invalid structured output, confidence validation, uploads, catalog routes, and health. Two non-fatal environment/library warnings remain.

```text
cd frontend
npm run build
```

Result: **PASS** — compilation, linting, type checking, and route generation completed successfully.

### Runtime Verification

- Restored requested baseline to exactly three preloaded videos by removing the earlier generated upload-test artifact: **PASS**
- All three watch pages rendered their correct video source: **PASS**
- Existing local playback error state remained clear: **PASS**
- Homepage displayed exactly three videos: **PASS**
- All three automatic thumbnails were generated from their videos: **PASS**
- Missing Gemini key returned HTTP 503: **PASS**
- Frontend rendered a retryable failure and did not fabricate placement output: **PASS**
- Browser console errors: **none**
- Real Gemini analysis: **BLOCKED — `GEMINI_API_KEY` is not configured**

### Gemini Model

Configured default: `gemini-2.5-flash`. It can be changed with `GEMINI_MODEL`. No model call was billed or completed because the API key is absent.

### Important Decisions

- Gemini logic remains isolated from API routing and catalog resolution.
- Successful results only are cached; failed or invalid responses are never cached.
- Cached analysis is invalidated when video size, modification time, or configured model changes.
- The API always overwrites the returned `video_id` with the catalog ID being analyzed.
- Remote Gemini file resources are deleted after each analysis attempt.
- No OpenAI, Anthropic, database, ClickHouse, ADK, compositing, product generation, or advertiser-selection code was added.

### Known Issues / Blocker

- A valid Gemini API key must be configured and the backend restarted before real video analysis can be verified.
- Large video uploads and Gemini processing can take several minutes.
- Current analysis represents an overall-video summary with zero or more timed placement opportunities; it does not yet model a full multi-scene timeline.
- The existing Friends/TBS clip remains unsuitable for final hackathon submission under the blueprint's licensing rule.

### Next Step

Set `GEMINI_API_KEY`, restart FastAPI, click **Analyze with Gemini** on one preloaded video, and verify the real structured result. Do not begin product generation, compositing, ClickHouse, or campaign selection before this verification passes.

---

## 2026-08-12 — Local Creator Upload to Catalog and Playback

### Status

🟢 **Completed**

### Phase

Phase 4 — Creator Studio (local development prototype)

### Summary

Implemented the first complete creator workflow using local development storage only. A creator can select an MP4 in `/studio/upload`, enter metadata, monitor upload progress, and submit it to FastAPI. The backend stores the MP4 and JSON metadata under an ignored upload directory, immediately exposes the video through the catalog API, and serves the file for thumbnail generation and watch-page playback. No authentication, database, cloud storage, or AI service was introduced.

### Features Added

- Creator Studio dashboard at `/studio`
- Upload form at `/studio/upload`
- MP4 picker, title, creator, description, category, progress, and status UI
- `POST /api/videos/upload` multipart endpoint
- MP4 content-type and extension validation
- Chunked local file writing
- Persistent local JSON upload catalog
- FastAPI static serving at `/uploads/videos/...`
- Automatic redirect to the refreshed homepage after successful upload
- Uploaded-video support in homepage cards, generated thumbnails, Studio listings, and watch pages
- Header Upload action now links to Creator Studio upload

### Files Created

```text
frontend/app/studio/page.tsx
frontend/app/studio/upload/page.tsx
```

### Files Modified

```text
.gitignore
backend/app/api/videos.py
backend/app/main.py
backend/app/services/video_catalog.py
backend/requirements.txt
backend/tests/test_videos.py
frontend/app/globals.css
frontend/components/layout/Header.tsx
frontend/lib/categories.ts
frontend/services/video-service.ts
PROJECT_UPDATE.md
```

### Runtime Files Created and Ignored

```text
backend/uploads/videos/catalog.json
backend/uploads/videos/local-upload-workflow-test-2bb8fb79.mp4
```

### Dependencies Added

```text
python-multipart>=0.0.9
```

### API Changes

```text
POST /api/videos/upload
GET  /uploads/videos/{filename}
```

The upload endpoint accepts multipart fields `file`, `title`, `creator`, `description`, and `category`, and returns the created video metadata with HTTP 201.

### Tests Performed

```text
cd backend
python -m pytest
```

Result: **PASS** — 6 tests passed. Coverage includes successful upload, catalog/detail availability, and non-MP4 rejection. Pytest reported one non-fatal cache warning.

```text
cd frontend
npm run build
```

Result: **PASS** — compilation, linting, type checking, and generation of `/`, `/studio`, `/studio/upload`, and `/watch/[videoId]` completed successfully.

### End-to-End Verification

- Uploaded the smallest existing MP4 through `/studio/upload`: **PASS**
- Upload progress completed and redirected to the homepage: **PASS**
- New `Local Upload Workflow Test` card appeared as the fourth catalog item: **PASS**
- Uploaded card thumbnail was extracted from the FastAPI-served video: **PASS**
- Uploaded watch page loaded the correct FastAPI media URL without errors: **PASS**
- Creator Studio displayed four available videos: **PASS**
- Existing `gaming-room-tour` watch page remained functional: **PASS**
- Uploaded media byte-range request returned HTTP 206: **PASS**
- Frontend and backend returned HTTP 200 after final restart: **PASS**
- `git check-ignore` confirmed both uploaded MP4 and JSON catalog are ignored: **PASS**
- Browser console errors: **none**

### Important Decisions

- Upload metadata uses an ignored JSON file only for this development proof; PostgreSQL remains deferred.
- Existing three demo MP4s remain in `frontend/public/videos` and are not moved.
- New uploaded media is served by FastAPI, while existing demo media continues to be served by Next.js.
- Uploaded video duration is labeled `Uploaded video` because no FFmpeg/OpenCV dependency is being introduced in this step.

### Known Issues

- Local JSON catalog writes are suitable only for single-process development and are not production-safe.
- Upload size limits and production-grade media validation are not yet implemented.
- Uploaded metadata has no edit/delete workflow.
- The existing Friends/TBS demo footage should still be replaced with original or properly licensed content before submission.

### Next Step

Stop after review of this verified upload → catalog → playback workflow. Do not begin another phase automatically.

---

## 2026-08-12 — FastAPI Video Catalog and API-Driven Viewer Pages

### Status

🟢 **Completed**

### Phase

Phase 2 — Video Experience

### Summary

Added a read-only FastAPI catalog for the three local development videos and changed the homepage and watch page to load video metadata from that API. The MP4 files remain in `frontend/public/videos` and continue to be served by Next.js. Automatic browser-side thumbnail extraction and native video playback were preserved.

### Features Added

- `GET /api/videos` returns exactly the three local catalog entries
- `GET /api/videos/{video_id}` returns one catalog entry or HTTP 404
- Homepage fetches and filters the FastAPI catalog
- Watch page fetches the selected video and related-video catalog from FastAPI
- User-facing API loading failure states
- Actual media durations recorded as `2:35`, `5:21`, and `2:23`

### Files Created

```text
backend/app/api/videos.py
backend/app/schemas/video.py
backend/app/services/video_catalog.py
backend/tests/test_videos.py
frontend/lib/categories.ts
```

### Files Modified

```text
backend/app/main.py
.gitignore
frontend/app/page.tsx
frontend/app/watch/[videoId]/page.tsx
frontend/components/video/CategoryPills.tsx
frontend/services/video-service.ts
PROJECT_UPDATE.md
```

### Files Removed

```text
frontend/lib/demo-videos.ts
frontend/lib/mock-data.ts
```

The removed files contained the obsolete hard-coded frontend video catalog.

### API Changes

```text
GET /api/videos
GET /api/videos/{video_id}
```

Each video response includes its ID, title, creator metadata, description, relative video URL, duration, category, views label, and upload-date label.

### Tests Performed

```text
cd backend
python -m pytest
```

Result: **PASS** — 4 tests passed. Pytest reported one non-fatal cache-directory warning.

```text
cd frontend
npm run build
```

Result: **PASS** — production compilation, linting, type checking, and route generation completed successfully.

### Runtime Verification

- `GET /api/videos`: **PASS** — HTTP 200 with exactly three expected IDs
- All three `GET /api/videos/{video_id}` requests: **PASS**
- Unknown video ID: **PASS** — HTTP 404
- Homepage: **PASS** — three API-backed cards rendered with no browser errors
- All three watch pages: **PASS** — correct title and MP4 source rendered
- Automatic thumbnails: **PASS** — all three card thumbnails were generated as JPEG data URLs from their MP4 files

### Important Decisions

- FastAPI owns development video metadata; the frontend no longer contains a duplicate catalog.
- Relative `/videos/...` URLs are returned because Next.js continues to serve the development MP4 files.
- No database, AI, cloud storage, authentication, or upload dependency was added.

### Known Issues

- Metadata remains an in-memory development catalog until the approved PostgreSQL phase.
- The frontend requires FastAPI at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
- The Friends/TBS clip appears incompatible with the blueprint's requirement to use original or properly licensed hackathon demo footage and should be replaced before submission.
- AI confidence and analysis controls remain presentation-only.

### Next Step

Review Phase 2 and replace any unlicensed demo media before beginning the next approved phase.

---

## 2026-08-12 — Real Local Video Catalog

### Status

🟢 **Completed**

### Phase

Phase 2 — Video Experience

### Summary

Replaced the placeholder video catalog with the three MP4 files currently stored in `frontend/public/videos`. The homepage now shows only real local videos, and every card links to a working watch route. When a separate thumbnail is unavailable, the browser extracts a frame from the video and uses it as the card thumbnail.

### Features Added

- Local MP4 playback through the native HTML5 video player
- One dynamic watch page per local video
- Browser-side video-frame thumbnail extraction
- Real titles and creator attribution derived from the filenames

### Files Modified

```text
frontend/lib/demo-videos.ts
```

### Media Added

```text
frontend/public/videos/2 Minute Ultimate Gaming Room Tour 2017 - Priscilla T (1080p).mp4
frontend/public/videos/Creative Studio Tour Desk Setup, Home Office, and Journaling Nook - Nache Snow (1080p).mp4
frontend/public/videos/Friends Joey's Bad Birthday Gift (Season 4 Clip) TBS - TBS (1080p).mp4
```

### Tests Performed

```text
cd frontend
npm run build
```

Result: **PASS** — homepage and `/watch/[videoId]` compiled successfully.

### Runtime Verification

```text
npm run start
GET http://localhost:3000
```

Result: **PASS** — frontend returned HTTP 200.

### Known Issues

- Video duration labels are descriptive placeholders rather than values extracted from media metadata.
- AI confidence values and analysis controls remain mock UI.
- Generated thumbnails are created in the browser and are not persisted as image files.

### Next Step

Read video duration from media metadata and implement the first backend video-analysis endpoint before connecting Gemini.

---

## 2026-08-12 — Phase 1 Foundation Implemented and Verified

### Status

🟢 **Completed**

### Phase

Phase 1 — Foundation

### Summary

Implemented the approved full-stack foundation: a responsive Next.js viewer interface, FastAPI backend, health endpoint, project directory structure, local mock assets, and baseline backend test.

### Features Added

- Next.js App Router frontend with TypeScript and Tailwind CSS
- Cinematic dark Adless visual identity
- Header, search box, responsive sidebar, category filters, and video grid
- FastAPI application with CORS and interactive API documentation
- `GET /health` system endpoint
- Placeholder directories for PostgreSQL, ClickHouse, services, schemas, models, agents, and video processing

### Files Created or Modified

```text
README.md
.env.example
.gitignore
LICENSE
frontend/app/*
frontend/components/layout/*
frontend/components/video/*
frontend/lib/*
frontend/services/video-service.ts
frontend/types/index.ts
frontend/package.json
backend/app/main.py
backend/app/core/config.py
backend/tests/test_health.py
backend/requirements.txt
database/postgres/README.md
database/clickhouse/README.md
docs/README.md
```

### API Changes

```text
GET /health
```

Current response:

```json
{
  "status": "ok",
  "app": "Adless",
  "version": "0.1.0"
}
```

### Tests Performed

```text
cd backend
python -m pytest
```

Result: **PASS** — 1 test passed. Pytest reported a non-fatal cache-directory warning.

### Build Verification

- Frontend: **PASS** (`npm run build`)
- Backend tests: **PASS** (`python -m pytest`)
- Frontend runtime: **PASS** (HTTP 200)

### Important Decisions

- The established architecture remains Next.js, FastAPI, PostgreSQL, ClickHouse, Gemini, Google ADK, Google Cloud Storage, Cloud Run, and FFmpeg/OpenCV.
- No database, cloud, AI, agent, authentication, or video-compositing integration was introduced during Phase 1.
- Local assets are preferred for the core viewer experience.

### Known Issues

- The frontend currently uses Next.js 14 rather than the planning record's requested current stable release.
- Most navigation and social-action controls are presentation-only.
- The repository's new application scaffold is not yet committed.

### Next Step

Review and commit the completed Phase 1 and partial Phase 2 work, then implement one small backend video workflow at a time.

---

## 2026-08-12 — Phase 1 Implementation Plan Approved

### Status

🟡 **Superseded by completed implementation**

### Phase

Phase 1 — Foundation

### Summary

The Phase 1 implementation plan was reviewed and approved. It called for a minimal Next.js, TypeScript, Tailwind CSS, FastAPI, Uvicorn, Pydantic, and Pytest foundation with a local mock homepage and `GET /health` endpoint.

The plan explicitly deferred authentication, PostgreSQL, ClickHouse, ClickHouse MCP, Gemini, Google ADK, Vertex AI, Google Cloud Storage, uploads, real playback, creator tools, advertiser tools, product placement, compositing, campaign selection, and analytics.

### Approved Verification

```text
cd backend
pytest tests/
uvicorn app.main:app --reload --port 8000

cd frontend
npm run build
npm run dev
```

### Infrastructure Recorded

- Google Cloud project: `adless-ai-2026`
- Vertex AI monthly spend budget: $50 with 50%, 80%, and 100% notifications
- Separate Cloud Run spend protection configured
- Google Cloud promotional credit: $100
- ClickHouse Cloud promotional credit: $400
- ClickHouse integration not yet implemented

### Original Next Step

Implement and review Phase 1 before beginning Phase 2. This step has now been completed.

---

## Current Architecture Status

| Component | Technology | Status |
| --- | --- | --- |
| Frontend | Next.js + TypeScript | Implemented |
| Styling | Tailwind CSS | Implemented |
| Backend | FastAPI + Python | Foundation implemented |
| Video playback | HTML5 video | Implemented for local demo files |
| App database | PostgreSQL | Not started |
| Analytics database | ClickHouse | Not started |
| ClickHouse MCP | mcp-clickhouse | Not started |
| AI | Gemini | Not started |
| Agent framework | Google ADK | Not started |
| Video storage | Google Cloud Storage | Not started |
| Deployment | Cloud Run | Not started |
| Video processing | FFmpeg / OpenCV | Not started |
| Product placement | Adless AI pipeline | Not started |
| Placement QA | Gemini | Not started |

## Current Blockers

None.

## Next Immediate Action

Commit the verified foundation and local-video experience, then define and implement the first backend video API without prematurely adding Gemini, databases, or cloud infrastructure.

## Reference Principle

`PROJECT_BLUEPRINT.md` answers: **What should Adless become?**

`PROJECT_UPDATE.md` answers: **What has actually been built so far?**
