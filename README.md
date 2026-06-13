# CURATOR — Video Intelligence Platform

> A competitive intelligence platform for ingesting, analyzing, and deriving strategic insights from brand campaign videos using AI.



https://github.com/user-attachments/assets/d53d0151-daaa-47d2-8e32-e6d5e0bb1ce0



---

## What is Curator?

**Curator** is a multi-modal competitive intelligence platform built for brand strategists and design analysts. It enables teams to ingest competitor brand campaigns (combining videos and companion print/art assets), automatically critique their design layout, and surface cross-brand reports—including dynamic color palettes, typography matrices, campaign slogans, and narrative pacing beats.

The platform is built around a clean three-stage workflow:

```
Upload Asset  →  Analysis  →  Insights
```

1. **Upload Asset** — Ingest a video campaign (via remote URL or file upload) and optionally attach print ads, key art, or storyboards.
2. **Analysis** — Search the transcript/scenes dynamically in natural language, play the campaign video via HLS, and inspect the AI-generated aesthetic design critique of the attached artwork.
3. **Insights** — Review per-brand intelligence reports detailing custom color palette ratios, typography matrices (Serif vs Sans-Serif font allocations), slogans, and exactly 4 narrative pacing beats.

---

## Features

| Feature | Description |
|---|---|
| 🎬 **Multi-modal Ingestion** | Ingest competitor video campaigns (remote URL scrape via **Bright Data** proxies or local file upload) with optional print art |
| 🖼️ **Creative Critique** | Extract visual design, composition, and aesthetic critique of print ads via **Kimi 2.6 / SenseNova** vision models |
| 🧠 **Dual-Layer Search** | Search over campaign transcripts and scene timelines simultaneously using natural language indexing powered by **VideoDB** |
| 📊 **Brand Aesthetics Insights** | Interactive dashboards showing dynamic color palettes, slogans, and 4 narrative pacing beats |
| 🗂️ **Typography Matrix** | Real-time typeface and font hierarchy matches (Serif vs Sans-Serif allocations) |
| 📹 **HLS Video Playback** | Native adaptive streaming support hosted on **VideoDB** and played via HLS.js |
| 🖥️ **Dashboard** | High-level metrics tracking recent campaigns, sentiment, and sector activity |

---

## Navigation

The top navigation bar exposes three main sections:

- **Dashboard** — High-level overview of ingested assets and platform activity
- **Insights** — Switch between brand assets to view AI-generated campaign intelligence reports
- **Archive** — Search and browse the full library of ingested videos; click "Analyze" on any asset to enter the Analysis view

The **Upload Asset** button in the top-right opens the ingestion console directly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express |
| AI & LLM | Kimi 2.6 & SenseNova API |
| Video DB / Indexing | VideoDB (transcription, scene slicing, stream hosting) |
| Proxy / Scraping | Bright Data (anti-bot bypass web scraping proxies) |
| Video Playback | HLS.js (adaptive streaming) |
| Icons | Lucide React |
| Animation | Motion (Framer Motion) |


---

## Project Structure

```
Curator/
├── src/
│   ├── App.tsx                   # Root application, routing, and state
│   └── components/
│       ├── Navbar.tsx            # Top navigation bar
│       ├── LandingScreen.tsx     # Entry/hero screen
│       ├── DashboardScreen.tsx   # Overview dashboard
│       ├── ArchiveScreen.tsx     # Asset library + ingestion console (dual mode)
│       ├── SearchScreen.tsx      # AI analysis view for a selected video
│       └── ReportsScreen.tsx     # Per-brand insights and campaign reports
├── server.ts                     # Express API server + Kimi 2.6 integration
├── vite.config.ts                # Vite build config
└── .env                          # API keys (not committed)
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/videos` | Fetch all ingested video assets |
| `POST` | `/api/scrape` | Ingest a video from a remote URL |
| `POST` | `/api/upload` | Ingest a locally uploaded video file |
| `POST` | `/api/query` | Run a semantic AI query against an asset's content |
| `GET` | `/api/reports-summary` | Fetch aggregated brand intelligence reports |

---
