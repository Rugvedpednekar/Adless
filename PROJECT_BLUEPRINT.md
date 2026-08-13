
# Adless — Project Blueprint

## 1. Project Overview

**Adless** is an AI-native video-sharing platform inspired by modern creator platforms such as YouTube.

Creators upload videos, viewers discover and watch content, and advertisers create campaigns.

The core innovation is **AI-powered contextual product placement**.

Instead of interrupting a viewer with a traditional advertisement:

```text
Video
→ Advertisement interruption
→ Video
```

Adless aims to provide:

```text
Video
→ Contextual product placement inside the scene
→ Video continues uninterrupted
```

The system uses:

* **Gemini** for multimodal video understanding and agent reasoning
* **Google ADK** for agent orchestration
* **ClickHouse** for campaign analytics and placement performance
* **ClickHouse MCP** for agent access to analytics
* **PostgreSQL** for transactional application data
* **Google Cloud Storage** for video and media storage
* **Cloud Run** for backend deployment
* **FFmpeg / OpenCV** for video processing and compositing

---

# 2. Core Product Statement

> Adless is an AI-powered creator video platform that enables creators to monetize content through context-aware product placements without interrupting the viewer experience.

---

# 3. Primary Hackathon Goal

The hackathon MVP must demonstrate the following complete workflow:

```text
Creator uploads video
        ↓
Gemini analyzes video
        ↓
Gemini detects suitable placement opportunities
        ↓
Agent queries ClickHouse using MCP
        ↓
Agent finds eligible advertising campaigns
        ↓
Gemini selects the best campaign
        ↓
Product is placed into the video
        ↓
Gemini performs placement QA
        ↓
Creator approves placement
        ↓
Video is published
        ↓
Viewer watches video
        ↓
Placement impression is recorded
        ↓
ClickHouse analytics are updated
```

The project must demonstrate **real runtime integration with Gemini, Google Cloud, and ClickHouse**.

ClickHouse must not exist only as a logo, mock integration, or README reference.

---

# 4. AI Development Rules

All AI coding agents working on this repository must follow these rules.

## Rule 1 — Read this file first

Before implementing a major feature, read `PROJECT_BLUEPRINT.md`.

## Rule 2 — Do not redesign the architecture automatically

Do not replace:

* Next.js
* FastAPI
* PostgreSQL
* ClickHouse
* Gemini
* Google ADK
* ClickHouse MCP
* Google Cloud Storage
* Cloud Run

unless the blueprint is intentionally updated first.

## Rule 3 — Build incrementally

Do not attempt to generate the entire application in one operation.

Build one feature at a time.

Each feature must:

1. compile
2. run locally
3. be tested
4. integrate with existing functionality
5. preserve the existing design

## Rule 4 — Never silently introduce services

Do not add:

* Firebase
* Supabase
* AWS
* Azure
* OpenAI
* Anthropic
* third-party AI APIs
* new databases
* paid external services

without explicit approval.

## Rule 5 — Hackathon AI restriction

The production application should use Google Cloud AI and permitted partner technologies.

Do not integrate:

* OpenAI API
* Anthropic API
* AWS Bedrock
* Azure OpenAI
* third-party foundation models

into the submitted runtime.

## Rule 6 — Preserve working functionality

Never rewrite a working feature purely for stylistic reasons.

Prefer small targeted changes.

## Rule 7 — Never expose credentials

All secrets must use environment variables.

Never commit:

* API keys
* database passwords
* service account credentials
* ClickHouse credentials
* Google Cloud credentials

to GitHub.

---

# 5. Product Name

**Name:** Adless

Possible tagline:

> Watch without interruptions.

Longer positioning:

> Contextual advertising that belongs in the scene, not between scenes.

---

# 6. User Roles

Adless has three primary user types.

## Viewer

A Viewer can:

* register
* sign in
* browse videos
* search videos
* watch videos
* view creator profiles
* like videos
* save videos
* subscribe to creators
* access watch history

Not all social features are required for the hackathon MVP.

---

## Creator

A Creator can:

* upload videos
* add title
* add description
* add thumbnail
* select category
* manage uploaded content
* trigger AI analysis
* review AI-detected placement opportunities
* approve/reject product placements
* publish videos
* view video analytics
* view placement monetization analytics

---

## Advertiser

An Advertiser can:

* create campaign
* define fictional product
* upload product image
* select product category
* choose campaign markets
* configure contextual targeting
* configure blocked contexts
* activate/deactivate campaigns
* view impression analytics
* view placement performance

---

# 7. Main Applications

Adless consists of three experiences.

## 7.1 Viewer Platform

Example route:

```text
/
```

Primary navigation:

```text
Home
Explore
Subscriptions
History
Liked Videos
```

Top navigation:

```text
Adless
Search
Upload
Notifications
Profile
```

Homepage should contain video sections such as:

```text
Recommended
Trending
Technology
Gaming
Entertainment
Recently Uploaded
```

---

# 8. Viewer Pages

## Homepage

Route:

```text
/
```

Contains:

* responsive sidebar
* search
* video grid
* creator information
* thumbnails
* views
* upload date

---

## Video Watch Page

Route:

```text
/watch/[videoId]
```

Contains:

* large video player
* video title
* creator name
* subscribe button
* views
* description
* related videos
* like button

Example layout:

```text
┌───────────────────────────────────────────────┐
│                                               │
│                 VIDEO PLAYER                  │
│                                               │
└───────────────────────────────────────────────┘

Building an AI Product in 24 Hours

Ved Creates        Subscribe

126K views

Description...
```

---

## Search Page

Route:

```text
/search?q=
```

Contains search results for:

* videos
* creators
* categories

---

## Creator Channel

Route:

```text
/channel/[creatorId]
```

Contains:

* creator profile
* banner
* subscriber count
* videos

---

# 9. Adless Studio

Creator dashboard route:

```text
/studio
```

Navigation:

```text
Dashboard
Content
Upload
AI Placements
Analytics
Monetization
```

---

# 10. Creator Upload Workflow

Route:

```text
/studio/upload
```

Step 1:

Creator selects video.

Step 2:

Upload video to Google Cloud Storage.

Step 3:

Creator enters:

```text
Title
Description
Category
Thumbnail
Visibility
```

Step 4:

Save metadata to PostgreSQL.

Step 5:

Creator can select:

```text
Analyze with Adless AI
```

---

# 11. AI Scene Analysis

Gemini analyzes the uploaded video.

It should determine:

* scenes
* timestamps
* environment
* mood
* objects
* visible surfaces
* product placement opportunities
* inappropriate placement contexts

Example Gemini structured output:

```json
{
  "video_id": "video_123",
  "scenes": [
    {
      "start_time": 18.2,
      "end_time": 31.7,
      "environment": "living_room",
      "mood": "casual_positive",
      "objects": [
        "sofa",
        "coffee_table",
        "lamp"
      ],
      "placement_opportunities": [
        {
          "surface": "coffee_table",
          "recommended_categories": [
            "snack",
            "beverage"
          ],
          "confidence": 0.94
        }
      ]
    }
  ]
}
```

Gemini must return structured data whenever possible.

---

# 12. Placement Safety Rules

The AI should avoid placements where the advertisement:

* covers a person's face
* covers subtitles
* covers important scene objects
* appears during highly sensitive scenes
* creates inappropriate associations
* significantly distracts from content
* looks physically impossible
* violates campaign restrictions

Example blocked scene types:

```text
medical emergency
funeral
violence
serious injury
highly emotional scene
sensitive political context
dangerous activity
```

---

# 13. Campaign Selection Agent

After Gemini finds an eligible scene, the campaign selection agent queries ClickHouse.

Example request:

```text
Find active snack or beverage campaigns
for the United States
that allow casual living-room contexts.
Rank campaigns by historical placement performance.
```

The agent must access ClickHouse through the official ClickHouse MCP integration.

---

# 14. Example Campaigns

Use fictional brands during the hackathon.

Examples:

```text
CrunchPop
Category: Snacks
```

```text
Nova Cola
Category: Beverage
```

```text
BeanBox
Category: Coffee
```

```text
VoltBook
Category: Technology
```

```text
SpiceBite
Category: Snacks
```

Do not depend on copyrighted brands or third-party logos for the demo.

---

# 15. Campaign Example

```json
{
  "campaign_id": "camp_102",
  "brand": "CrunchPop",
  "product": "CrunchPop Classic Chips",
  "category": "snack",
  "market": "US",
  "allowed_contexts": [
    "living_room",
    "party",
    "casual_conversation"
  ],
  "blocked_contexts": [
    "medical",
    "violence",
    "funeral"
  ],
  "status": "active"
}
```

---

# 16. Campaign Selection Example

Gemini analyzes:

```text
Environment:
Living room

Mood:
Casual

Surface:
Coffee table

Recommended categories:
Snack
Beverage
```

ClickHouse MCP returns:

```text
CrunchPop
historical engagement = 8.4%

Nova Cola
historical engagement = 6.9%
```

Agent chooses:

```text
CrunchPop
```

Reason:

```text
Strong contextual match and highest historical performance
for similar scenes.
```

---

# 17. Video Placement Pipeline

The first implementation does not need Hollywood-quality generative VFX.

Initial pipeline:

```text
Video
↓
Extract frames
↓
Determine placement coordinates
↓
Resize product asset
↓
Perspective adjustment
↓
Alpha compositing
↓
Basic lighting adjustment
↓
Track position
↓
Render frames
↓
Encode output video
```

Recommended tools:

```text
FFmpeg
OpenCV
Python
```

Later versions may experiment with Google generative media capabilities.

---

# 18. Placement QA Agent

After compositing, Gemini should review the resulting scene.

Example structured response:

```json
{
  "placement_quality": {
    "blocks_face": false,
    "blocks_subtitles": false,
    "contextually_relevant": true,
    "realistic_scale": true,
    "brand_visible": true,
    "safe_context": true,
    "confidence": 0.91,
    "approved": true
  }
}
```

If:

```text
approved = false
```

the placement should not automatically publish.

---

# 19. Creator Placement Review

Route:

```text
/studio/placements
```

Display:

```text
Video
Scene timestamp
Detected surface
Selected campaign
AI confidence
Before preview
After preview
```

Actions:

```text
Approve
Reject
Regenerate
```

---

# 20. Viewer Playback

Once published, the viewer sees the approved version.

Example:

```text
Original scene

Two people talking
Empty coffee table
```

After placement:

```text
Two people talking
CrunchPop product naturally appears on coffee table
```

No traditional advertisement break is required for the demo.

---

# 21. Dynamic Campaign Demo

## Shoppable Contextual Placements

Approved contextual placements extend the existing rendered-video pipeline with a separate, player-controlled interactive layer:

```text
Approved Creator Placement
        ↓
Placement Manifest
        ↓
Adless Video Player
        ↓
Timed Sponsored Product CTA
        ↓
Viewer Interaction
        ↓
ClickHouse Analytics
```

The product remains visually composited into the video by the existing Gemini localization and OpenCV/FFmpeg rendering pipeline. Sponsored CTA controls are never burned into the MP4; they are rendered by the Next.js player from a validated placement manifest and respond to actual playback time. Only creator-approved placements may enter a viewer manifest—Gemini QA approval alone is insufficient. Anonymous placement impression, exposure, CTA impression, click, and dismiss events are recorded in ClickHouse through the FastAPI backend. Checkout and payment processing remain outside the MVP.

---

One important hackathon demo feature should be the ability to change market.

Example:

```text
Market = United States
→ CrunchPop
```

```text
Market = India
→ SpiceBite
```

This demonstrates that the same placement opportunity can support different campaigns.

The MVP does not need to perform real-time generative rendering for every viewer.

Pre-rendered variants are acceptable for the demonstration.

---

# 22. Advertiser Dashboard

Route:

```text
/advertiser
```

Navigation:

```text
Dashboard
Campaigns
New Campaign
Analytics
```

---

# 23. Create Campaign

Route:

```text
/advertiser/campaigns/new
```

Fields:

```text
Campaign name
Brand name
Product name
Product category
Product asset
Markets
Allowed contexts
Blocked contexts
Start date
End date
Status
```

Optional future fields:

```text
Budget
CPM
Daily limit
```

Real financial transactions are outside MVP scope.

---

# 24. Advertiser Analytics

Example:

```text
CrunchPop Summer Campaign

Impressions
126,841

Placements
4,120

Average exposure
6.4 seconds

Best environment
Living Room

Best category
Lifestyle

Best market
United States
```

ClickHouse should power these analytical queries.

---

# 25. Database Responsibilities

Use PostgreSQL and ClickHouse for different purposes.

---

# 26. PostgreSQL

PostgreSQL stores transactional application data.

Primary tables:

```text
users
creator_profiles
advertiser_profiles
videos
channels
subscriptions
likes
watchlists
campaigns
products
placement_opportunities
placement_approvals
```

---

# 27. PostgreSQL Initial Schema

## users

```text
id
email
password_hash
display_name
role
avatar_url
created_at
updated_at
```

Roles:

```text
viewer
creator
advertiser
admin
```

---

## videos

```text
id
creator_id
title
description
storage_url
thumbnail_url
duration
category
visibility
processing_status
created_at
published_at
```

---

## campaigns

```text
id
advertiser_id
name
brand_name
product_name
category
product_asset_url
market
allowed_contexts
blocked_contexts
status
created_at
```

---

## placement_opportunities

```text
id
video_id
scene_start
scene_end
environment
surface
recommended_category
confidence
status
created_at
```

---

## placement_approvals

```text
id
placement_id
campaign_id
creator_id
status
preview_url
approved_at
```

---

# 28. ClickHouse

ClickHouse stores analytics and high-volume event data.

Initial tables:

```text
video_events
placement_events
campaign_performance
scene_analytics
```

---

# 29. video_events

Example fields:

```text
event_id
video_id
viewer_id
market
event_type
watch_position
device_type
timestamp
```

Possible events:

```text
video_start
video_pause
video_complete
```

---

# 30. placement_events

Example:

```text
event_id
placement_id
video_id
campaign_id
market
scene_type
placement_surface
impression
exposure_seconds
timestamp
```

---

# 31. campaign_performance

Example:

```text
campaign_id
market
scene_type
impressions
total_exposure_seconds
completion_rate
performance_score
updated_at
```

---

# 32. Why ClickHouse Matters

ClickHouse must play an important role in the AI workflow.

Gemini should use analytics such as:

```text
campaign performance
scene performance
market performance
historical impressions
exposure duration
placement success
```

to determine which campaign should be chosen.

Target flow:

```text
Gemini
↓
ClickHouse MCP
↓
Historical analytics
↓
Gemini decision
```

---

# 33. Backend

Backend framework:

```text
FastAPI
```

Language:

```text
Python
```

Responsibilities:

* authentication
* video metadata
* upload orchestration
* Gemini integration
* ADK agent execution
* ClickHouse MCP orchestration
* PostgreSQL operations
* placement processing
* analytics endpoints

---

# 34. Frontend

Framework:

```text
Next.js
```

Language:

```text
TypeScript
```

Styling:

```text
Tailwind CSS
```

Design:

```text
Dark
Modern
Clean
Cinematic
Creator-focused
Responsive
```

Do not copy YouTube pixel-for-pixel.

Adless must have its own visual identity.

---

# 35. Recommended Repository Structure

```text
adless/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   ├── video/
│   │   └── core/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── database/
│   ├── postgres/
│   └── clickhouse/
│
├── docs/
│
├── PROJECT_BLUEPRINT.md
├── README.md
├── LICENSE
├── .env.example
└── .gitignore
```

---

# 36. Agent Architecture

Initial agent design:

```text
                    Creator Video
                          │
                          ▼
                  Scene Analyzer
                       Gemini
                          │
                          ▼
               Placement Opportunity
                          │
                          ▼
                Campaign Selector
                   Gemini Agent
                          │
                          ▼
                 ClickHouse MCP
                          │
                          ▼
               Campaign Analytics
                          │
                          ▼
                 Campaign Selected
                          │
                          ▼
               Placement Processor
                          │
                          ▼
                    QA Agent
                       Gemini
                          │
                          ▼
              Creator Approval
```

---

# 37. Agent 1 — Scene Analyzer

Responsibilities:

* understand video
* split content into meaningful scenes
* identify environment
* detect potential surfaces
* recommend product categories
* assign confidence score
* block unsafe scenes

---

# 38. Agent 2 — Campaign Selector

Responsibilities:

* receive scene context
* call ClickHouse using MCP
* retrieve active campaigns
* compare historical performance
* enforce campaign restrictions
* select best campaign
* explain decision

---

# 39. Agent 3 — Placement QA

Responsibilities:

* review resulting placement
* check obstruction
* check realism
* check context
* check campaign compatibility
* approve/reject

---

# 40. Google Cloud

Google Cloud Project:

```text
Adless
```

Project ID:

```text
adless-ai-2026
```

Potential services:

```text
Vertex AI
Cloud Run
Cloud Storage
Secret Manager
Artifact Registry
```

Only enable services when they become necessary.

---

# 41. Cloud Storage Layout

Example:

```text
adless-media/
│
├── originals/
├── thumbnails/
├── product-assets/
├── previews/
└── processed/
```

---

# 42. Environment Variables

Example:

```text
DATABASE_URL=

CLICKHOUSE_HOST=
CLICKHOUSE_PORT=
CLICKHOUSE_DATABASE=
CLICKHOUSE_USERNAME=
CLICKHOUSE_PASSWORD=

GOOGLE_CLOUD_PROJECT=adless-ai-2026
GOOGLE_CLOUD_LOCATION=

GCS_BUCKET=

JWT_SECRET=
```

Never commit real values.

---

# 43. Authentication

MVP authentication:

```text
Email + Password
JWT
```

Passwords must be hashed.

Do not store plain text passwords.

OAuth can be added later if time allows.

---

# 44. Initial API Routes

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Videos

```text
GET  /api/videos
GET  /api/videos/{id}
POST /api/videos
POST /api/videos/{id}/upload
POST /api/videos/{id}/analyze
POST /api/videos/{id}/publish
```

## Placements

```text
GET  /api/videos/{id}/placements
POST /api/placements/{id}/select-campaign
POST /api/placements/{id}/render
POST /api/placements/{id}/approve
POST /api/placements/{id}/reject
```

## Campaigns

```text
GET  /api/campaigns
POST /api/campaigns
GET  /api/campaigns/{id}
PATCH /api/campaigns/{id}
```

## Analytics

```text
POST /api/events
GET  /api/analytics/videos/{id}
GET  /api/analytics/campaigns/{id}
```

---

# 45. Hackathon Demo Content

Create original or properly licensed demo videos.

Do not use:

```text
Netflix footage
Friends episodes
YouTube creators' copyrighted footage
commercial brand logos
commercial product assets
```

Use fictional brands and owned/demo footage.

---

# 46. MVP Scope

The hackathon MVP MUST have:

* working homepage
* video browsing
* working video player
* creator upload
* creator dashboard
* advertiser campaign creation
* PostgreSQL integration
* ClickHouse Cloud integration
* official ClickHouse MCP connection
* Gemini video analysis
* at least one AI placement opportunity
* campaign selection using ClickHouse data
* working before/after product placement
* Gemini QA step
* creator approve/reject
* placement impression analytics
* deployed application
* public GitHub repository
* README
* open-source license
* demo video

---

# 47. Nice-to-Have Features

Only implement after the core workflow works.

Possible additions:

* subscriptions
* comments
* likes
* recommendations
* advanced search
* multiple creator channels
* creator earnings simulation
* advertiser budget optimization
* multiple product variants
* geographic placement variants
* HLS streaming
* real-time campaign assignment
* automatic thumbnail generation

---

# 48. Explicitly Out of Scope

Do NOT spend hackathon time building:

* Netflix-scale CDN
* DRM
* payment processing
* real advertiser billing
* real creator payouts
* live streaming
* full recommendation ML system
* complex social network
* production-scale moderation
* mobile native applications
* hundreds of videos
* Hollywood-quality VFX
* real-time per-frame generative video

---

# 49. Build Phases

## Phase 1 — Foundation

Goal:

```text
Application runs locally.
```

Build:

* Next.js frontend
* FastAPI backend
* repository structure
* environment configuration
* health endpoint

---

## Phase 2 — Viewer Experience

Build:

* Adless homepage
* video cards
* watch page
* working video playback
* responsive layout

---

## Phase 3 — Authentication

Build:

* registration
* login
* JWT
* viewer
* creator
* advertiser roles

---

## Phase 4 — Creator Studio

Build:

* studio dashboard
* upload page
* video metadata
* Google Cloud Storage upload

---

## Phase 5 — PostgreSQL

Connect:

* users
* videos
* campaigns
* placement opportunities

---

## Phase 6 — ClickHouse

Connect ClickHouse Cloud.

Create:

* placement events
* video events
* campaign analytics

Insert sample analytics data.

---

## Phase 7 — Gemini

Implement:

```text
Video
→ Gemini
→ structured scene analysis
```

---

## Phase 8 — ClickHouse MCP

Implement:

```text
Gemini Agent
→ ClickHouse MCP
→ campaign analytics
→ campaign decision
```

This is a critical hackathon milestone.

---

## Phase 9 — Placement

Implement one reliable placement pipeline.

Goal:

```text
Original video
→ fictional product inserted
→ processed video
```

---

## Phase 10 — QA

Gemini reviews placement.

Return:

```text
approved
confidence
quality checks
```

---

## Phase 11 — Advertiser Portal

Create campaigns.

Display analytics.

---

## Phase 12 — End-to-End Demo

Complete:

```text
Upload
→ Analyze
→ Select campaign
→ Place product
→ QA
→ Approve
→ Publish
→ Watch
→ Record impression
→ Analytics
```

---

# 50. Development Priority

Always prioritize:

```text
WORKING
over
PERFECT
```

Then:

```text
CORE AI WORKFLOW
over
EXTRA PLATFORM FEATURES
```

Then:

```text
REAL INTEGRATION
over
MOCK DATA
```

Then:

```text
STRONG DEMO
over
LARGE FEATURE COUNT
```

---

# 51. Definition of Hackathon Success

Adless is successful when a judge can watch the demo and clearly understand:

### Problem

Traditional video advertisements interrupt viewers.

### Solution

AI identifies natural contextual product-placement opportunities.

### Gemini's role

Gemini understands the video and makes contextual decisions.

### ClickHouse's role

ClickHouse provides real campaign and historical analytics used by the agent.

### Product result

The viewer watches a video containing an integrated product placement without an ad interruption.

### Business result

Creators gain a new monetization method and advertisers receive measurable placement analytics.

---

# 52. Core Demo Sentence

> Adless uses Gemini to understand what's happening inside a video and ClickHouse to determine which campaign belongs there, creating contextual product placements that monetize content without interrupting the viewer.

---

# 53. Final Product Principle

Adless should never feel like:

> AI randomly puts advertisements into videos.

It should feel like:

> AI understands the content, identifies an appropriate opportunity, uses real advertising intelligence to select a compatible campaign, creates a placement, validates the result, and measures its performance.

That distinction is the foundation of the entire project.
