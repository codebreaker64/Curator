import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { connect } from "videodb";
import multer from "multer";
import fs from "fs";

dotenv.config();

if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}
const upload = multer({ dest: "temp/" });

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to local simulation mode.");
      throw new Error("GEMINI_API_KEY is required for intelligence features. Please configure it in your Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory Competitor Intelligence Database (CURATOR Archive)
interface TranscriptSegment {
  time: string;
  seconds: number;
  text: string;
  label?: string;
}

interface SceneSegment {
  start: number;
  end: number;
  label: string;
  color: string;
}

interface VideoAsset {
  id: string;
  title: string;
  description: string;
  url: string;
  streamUrl: string;
  duration: string;
  durationSec: number;
  detectedTime: string;
  sector: string;
  spokenTranscript: TranscriptSegment[];
  visualScenes: SceneSegment[];
  brandSentimentScore: number; // e.g. +12 or -5
  dominantColorPalette: { name: string; percentage: number; hex: string }[];
  thematicFocus: { topic: string; percentage: number; color: string }[];
  sceneIndexId?: string;
  isImage?: boolean;
  attachedImageUrl?: string;
  attachedImageAnalysis?: string;
  typographyRatios?: { name: string; ratio: number }[];
  pacingBeats?: { time: string; name: string; desc: string; color: string }[];
  slogan?: string;
}

// Seed Database matching CURATOR exhibition visual styles
let competitorArchive: VideoAsset[] = [
  {
    id: "asset-04a-99",
    title: "Metropolis Structural Survey Keynote",
    description: "Competitor 'Alpha' Product Launch detailing structural parameters with full macro scene scanning.",
    url: "https://competitor-alpha.com/keynote-2026",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // High quality public HLS test stream (Big Buck Bunny)
    duration: "06:45",
    durationSec: 405,
    detectedTime: "2 hours ago",
    sector: "Technology Infrastructure",
    brandSentimentScore: 12,
    attachedImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    attachedImageAnalysis: "Architectural blueprint and glass facade render showing structural load distributions under stress simulations. The blue and grey tones emphasize safety, technical precision, and minimalist steel design themes.",
    dominantColorPalette: [
      { name: "Onyx", percentage: 85, hex: "#1A1A1A" },
      { name: "Alabaster", percentage: 60, hex: "#F9F9F7" },
      { name: "Slate", percentage: 45, hex: "#4A5D70" },
      { name: "Clay", percentage: 20, hex: "#C47B5F" }
    ],
    thematicFocus: [
      { topic: "Product Features", percentage: 65, color: "#1A1C1B" },
      { topic: "Corporate Culture", percentage: 20, color: "#4A5D70" },
      { topic: "Sustainability", percentage: 15, color: "#C47B5F" }
    ],
    spokenTranscript: [
      { time: "01:25", seconds: 85, text: "We have finalized our preliminary strategic rollouts targeting decentralized enterprise clouds.", label: "Product Roadmap" },
      { time: "01:45", seconds: 105, text: "The primary load-bearing structures on the south elevation show minimal signs of degradation despite the environmental factors.", label: "Structural Report" },
      { time: "02:14", seconds: 134, text: "However, we must direct our attention to the tension cables anchoring the secondary facade. There is an anomaly in the stress distribution pattern.", label: "Critical Finding" },
      { time: "02:40", seconds: 160, text: "I recommend a localized acoustic resonance test before the next structural sign-off phase." },
      { time: "03:15", seconds: 195, text: "Moving to the interior atrium, the light diffusion panels are operating within standard parameters, requiring no immediate intervention.", label: "Interior" },
      { time: "04:02", seconds: 242, text: "This concludes the preliminary visual inspection of quadrant four. Data logs will be uploaded to the central repository." }
    ],
    visualScenes: [
      { start: 0, end: 90, label: "Structural Render", color: "#4A5D70" },
      { start: 91, end: 180, label: "Facade Anomaly Grid", color: "#C47B5F" },
      { start: 181, end: 320, label: "Atrium Interior Scan", color: "#1A1A1A" },
      { start: 321, end: 405, label: "Concluding Telemetry", color: "#747878" }
    ],
    typographyRatios: [
      { name: "Serif (Playfair Display)", ratio: 15 },
      { name: "Sans-Serif (Inter)", ratio: 85 }
    ],
    slogan: "Precision in every parameter.",
    pacingBeats: [
      { time: "00:00", name: "The Blueprint Hook", desc: "Opens with macro architectural blueprint sweeps. Clear geometry vectors outline structural tension calculations.", color: "#4A5D70" },
      { time: "01:30", name: "Structural Integrity", desc: "Shifts to visual facade testing sequences. Detailed stress parameters are calculated and displayed on screen overlays.", color: "#C47B5F" },
      { time: "03:15", name: "Atrium Environmental Scan", desc: "Dives into interior light diffusion metrics. Visualizing optimal luxury building climate configurations.", color: "#1A1A1A" },
      { time: "05:30", name: "Strategic Consensus", desc: "Concludes with centralized telemetry synchronization. Solidifies technical compliance models for the final rollout.", color: "#747878" }
    ]
  },
  {
    id: "beta-corp-q3",
    title: "Beta Corp - Q3 Earnings & Strategy Call",
    description: "CFO discusses supply chain optimizations, AI workflows, and active defense patterns.",
    url: "https://betacorp.org/earnings-q3",
    streamUrl: "https://playertest.longtailvideo.com/adaptive/control/manifest.m3u8", // High quality HLS stream
    duration: "02:15",
    durationSec: 135,
    detectedTime: "2 hours ago",
    sector: "Logistics & Supply Chain",
    brandSentimentScore: 8,
    dominantColorPalette: [
      { name: "Onyx", percentage: 70, hex: "#1A1A1A" },
      { name: "Slate", percentage: 55, hex: "#4A5D70" },
      { name: "Alabaster", percentage: 40, hex: "#F9F9F7" },
      { name: "Clay", percentage: 10, hex: "#C47B5F" }
    ],
    thematicFocus: [
      { topic: "Supply Chain", percentage: 50, color: "#4A5D70" },
      { topic: "AI Integration", percentage: 40, color: "#1A1C1B" },
      { topic: "Risk Mitigation", percentage: 10, color: "#C47B5F" }
    ],
    spokenTranscript: [
      { time: "00:15", seconds: 15, text: "In Q3, we streamlined logistics by deploying predictive AI routing overlays." },
      { time: "00:45", seconds: 45, text: "AI integration has allowed us to cut fleet latency by approximately twelve percent.", label: "Efficiency Gain" },
      { time: "01:20", seconds: 80, text: "We expect current transport bottlenecks to resolve safely ahead of the peak holiday cycles.", label: "Supply Forecast" }
    ],
    visualScenes: [
      { start: 0, end: 40, label: "Route Telemetry Interface", color: "#4A5D70" },
      { start: 41, end: 95, label: "AI Latency Analysis", color: "#1A1A1A" },
      { start: 96, end: 135, label: "Global Shipping Graph", color: "#C47B5F" }
    ],
    typographyRatios: [
      { name: "Serif (Playfair Display)", ratio: 35 },
      { name: "Sans-Serif (Inter)", ratio: 65 }
    ],
    slogan: "Decentralized logistics, unified execution.",
    pacingBeats: [
      { time: "00:00", name: "Logistics Overview", desc: "Initiates with strategic global trade maps. Overlays highlight the optimization of supply routes.", color: "#4A5D70" },
      { time: "00:30", name: "Predictive Routing Hook", desc: "Visualizes the fleet latency calculations. Demonstrates real-time AI computational routing efficiencies.", color: "#1A1A1A" },
      { time: "01:10", name: "Market Capacity Forecast", desc: "Displays supply buffer graphs. Details the resolution of logistics gridlocks ahead of consumer cycles.", color: "#C47B5F" },
      { time: "01:50", name: "Financial Conclusion", desc: "Closes with projected capital layouts. Summarizes supply chain risk mitigation protocols.", color: "#747878" }
    ]
  },
  {
    id: "gamma-startup-promo",
    title: "Gamma Startup - Creative Brand Showcase",
    description: "New aggressive marketing campaign targeting Gen-Z audience with high aesthetic density.",
    url: "https://gamma.io/manifesto-2026",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    duration: "00:45",
    durationSec: 45,
    detectedTime: "5 hours ago",
    sector: "Retail Design",
    brandSentimentScore: -5,
    dominantColorPalette: [
      { name: "Clay", percentage: 80, hex: "#C47B5F" },
      { name: "Onyx", percentage: 50, hex: "#1A1A1A" },
      { name: "Alabaster", percentage: 30, hex: "#F9F9F7" },
      { name: "Slate", percentage: 10, hex: "#4A5D70" }
    ],
    thematicFocus: [
      { topic: "Brand Manifesto", percentage: 70, color: "#C47B5F" },
      { topic: "Design Systems", percentage: 20, color: "#1A1C1B" },
      { topic: "Audience Target", percentage: 10, color: "#4A5D70" }
    ],
    spokenTranscript: [
      { time: "00:05", seconds: 5, text: "Forget legacy limitations. We designed our brand interfaces to act as physical objects in conversation." },
      { time: "00:25", seconds: 25, text: "A physical exhibition of contemporary precision designed to reduce digital clutter.", label: "Aesthetic Core" }
    ],
    visualScenes: [
      { start: 0, end: 20, label: "Brutalist Material Shots", color: "#C47B5F" },
      { start: 21, end: 45, label: "Minimalist Interface Display", color: "#1A1A1A" }
    ],
    typographyRatios: [
      { name: "Serif (Playfair Display)", ratio: 80 },
      { name: "Sans-Serif (Inter)", ratio: 20 }
    ],
    slogan: "Interfaces act as physical objects.",
    pacingBeats: [
      { time: "00:00", name: "The Manifesto Hook", desc: "Launches with brutalist raw material shots. Stark textures are framed by slow geometric camera sweeps.", color: "#C47B5F" },
      { time: "00:12", name: "Display Typography", desc: "Focuses on high-density typographic overlays. Highlights the integration of heritage display fonts.", color: "#1A1A1A" },
      { time: "00:25", name: "Physical Interfaces", desc: "Visualizes interactive modular UI panels. Frames the shift towards lightweight client-side applications.", color: "#4A5D70" },
      { time: "00:38", name: "Brutalist Synthesis", desc: "Ends with high-contrast minimalist brand lockups. Solidifies the retail design campaign manifesto.", color: "#747878" }
    ]
  },
  {
    id: "delta-tech-infrastructure",
    title: "Delta Tech - Secure Hub Facility Tour",
    description: "Architectural overview showing physical security and modular data configurations.",
    url: "https://deltatech.eu/facility-leak",
    streamUrl: "https://playertest.longtailvideo.com/adaptive/control/manifest.m3u8",
    duration: "12:30",
    durationSec: 750,
    detectedTime: "1 day ago",
    sector: "Technology Security",
    brandSentimentScore: 5,
    dominantColorPalette: [
      { name: "Slate", percentage: 75, hex: "#4A5D70" },
      { name: "Onyx", percentage: 65, hex: "#1A1A1A" },
      { name: "Alabaster", percentage: 40, hex: "#F9F9F7" },
      { name: "Clay", percentage: 5, hex: "#C47B5F" }
    ],
    thematicFocus: [
      { topic: "Facility Scale", percentage: 60, color: "#4A5D70" },
      { topic: "Modular Racks", percentage: 30, color: "#1A1C1B" },
      { topic: "Cooling Efficiency", percentage: 10, color: "#C47B5F" }
    ],
    spokenTranscript: [
      { time: "01:20", seconds: 80, text: "Each suite hosts twelve distinct multi-layer server partitions for isolated client routing.", label: "Server Arch" },
      { time: "04:10", seconds: 250, text: "Our cooling modules are fully independent, boasting a 1.08 PUE metric globally." },
      { time: "08:15", seconds: 495, text: "Physical access routes require biometric sequence checking at four perimeter rings.", label: "Perimeter Rings" }
    ],
    visualScenes: [
      { start: 0, end: 180, label: " biometric entry gate", color: "#4A5D70" },
      { start: 181, end: 420, label: "Server aisle perspective", color: "#1A1A1A" },
      { start: 421, end: 750, label: "Piping & Coolant grids", color: "#C47B5F" }
    ],
    typographyRatios: [
      { name: "Serif (Playfair Display)", ratio: 10 },
      { name: "Sans-Serif (Inter)", ratio: 90 }
    ],
    slogan: "Isolated client routing, verified security.",
    pacingBeats: [
      { time: "00:00", name: "Secure Access Hooks", desc: "Features biometric gate verification sequences. Outlines multiple perimeter ring validation protocols.", color: "#4A5D70" },
      { time: "03:00", name: "Facility Scale", desc: "Walks through high-density server racks. Highlights physical isolation boundaries for client partitions.", color: "#1A1A1A" },
      { time: "07:30", name: "Cooling Infrastructure", desc: "Sweeps piping and coolant grids. Visualizes PUE optimization metrics and thermal load balances.", color: "#C47B5F" },
      { time: "11:00", name: "Operations Sign-off", desc: "Ends with secure telemetry operations room status. Solidifies network infrastructure security standards.", color: "#747878" }
    ]
  }
];

// Helper to generate beautifully personalized and customized voice transcript dialogues and scene segmentations based on filename or URL
function getBespokeFallback(titleOrUrl: string, streamUrl: string) {
  const norm = (titleOrUrl || "").toLowerCase();
  
  let sector = "Retail Campaign";
  let description = "Stealth scraping extracted spoken-word layers, scene segmentations, and dynamic color timelines for fashion/retail domains.";
  let transcripts = [
    { time: "00:10", seconds: 10, text: "Welcome to our new retail concept layout. Here, we prioritized fluid physical interactions over digital overhead.", label: "Brand Hook" },
    { time: "00:35", seconds: 35, text: "Every designer asset has been catalogued to conform with contemporary high-contrast layouts.", label: "Visual Framework" },
    { time: "01:05", seconds: 65, text: "By deploying lightweight edge assets, we bypassed standard pipeline latency altogether.", label: "Decryption Gain" },
    { time: "01:40", seconds: 100, text: "This marks a permanent shift toward sustainable, client-side offline workshops.", label: "Aesthetic Focus" }
  ];
  let scenes = [
    { start: 0, end: 40, label: "Initial brand mood layout", color: "#4A5D70" },
    { start: 41, end: 90, label: "Close-up telemetry analytics", color: "#C47B5F" },
    { start: 91, end: 135, label: "Exhibition flow finalization", color: "#1A1A1A" }
  ];

  if (norm.includes("finance") || norm.includes("earning") || norm.includes("strategy") || norm.includes("q3") || norm.includes("q4") || norm.includes("report") || norm.includes("call") || norm.includes("budget")) {
    sector = "Corporate Strategy & Finance";
    description = "Corporate executive summary briefing, detailing logistics optimization, risk buffers, and macro brand performance index.";
    transcripts = [
      { time: "00:15", seconds: 15, text: "For the trailing fiscal period, our net digital margin expanded by approximately four percent.", label: "Financial Core" },
      { time: "00:45", seconds: 45, text: "Much of this growth can be attributed to tactical AI pipeline optimizations on regional nodes.", label: "Automation Gain" },
      { time: "01:15", seconds: 75, text: "We expect transport bottlenecks to resolve safely ahead of the peak holiday consumer cycles.", label: "Supply Forecast" },
      { time: "01:50", seconds: 110, text: "Furthermore, capital expenditures for research facilities are fully buffered for early 2027.", label: "Resource Outlook" }
    ];
    scenes = [
      { start: 0, end: 35, label: "Strategy opening timeline", color: "#4A5D70" },
      { start: 36, end: 85, label: "Margin development graph", color: "#1A1A1A" },
      { start: 86, end: 135, label: "Projected capital layout", color: "#C47B5F" }
    ];
  } else if (norm.includes("keynote") || norm.includes("apple") || norm.includes("launch") || norm.includes("tech") || norm.includes("product") || norm.includes("metropolis") || norm.includes("survey") || norm.includes("infrastructure")) {
    sector = "Technology & Product Design";
    description = "Pioneering keynote event detailing tension vectors, load-bearing stress parameters, and telemetry grids.";
    transcripts = [
      { time: "00:20", seconds: 20, text: "Our newly designed modular load-bearing panels are tested to withstand environmental stress factors indefinitely.", label: "Hardware Core" },
      { time: "00:55", seconds: 55, text: "We verified a twelve percent reduction in structural material overhead without compromising structural integrity.", label: "Metric Decoded" },
      { time: "01:30", seconds: 90, text: "Tension vectors on the secondary facades conform perfectly to our automated simulations.", label: "Telemetry Match" },
      { time: "02:10", seconds: 130, text: "This ensures immediate validation from central regulatory councils during our initial pre-check phase.", label: "Compliance Flow" }
    ];
    scenes = [
      { start: 0, end: 50, label: "Modular facade 3D render", color: "#1A1A1A" },
      { start: 51, end: 110, label: "High-density tension matrix", color: "#4A5D70" },
      { start: 111, end: 135, label: "Simulated load compliance charts", color: "#C47B5F" }
    ];
  } else if (norm.includes("tesla") || norm.includes("car") || norm.includes("electric") || norm.includes("vehicle") || norm.includes("driving") || norm.includes("mobility") || norm.includes("autonomous") || norm.includes("route")) {
    sector = "Autonomous Mobility Systems";
    description = "Detailed test sequence detailing localized frame vectors, biometric gates, and real-time obstacle sensors.";
    transcripts = [
      { time: "00:15", seconds: 15, text: "The primary onboard computational array updates at approximately two hundred hertz.", label: "Array Spec" },
      { time: "00:45", seconds: 45, text: "By deploying unified camera-based telemetry, we completely eliminated legacy sensor noise.", label: "Data Quality" },
      { time: "01:25", seconds: 85, text: "Obstacle avoidance trajectories show optimal routing offsets during extreme urban simulations.", label: "Safety Margin" },
      { time: "02:00", seconds: 120, text: "This model will roll out globally as an over-the-air update package inside forty-eight hours.", label: "OTA Release" }
    ];
    scenes = [
      { start: 0, end: 40, label: "Urban roadway lidar grid", color: "#1A1A1A" },
      { start: 41, end: 95, label: "Avoidance matrix calculation", color: "#C47B5F" },
      { start: 96, end: 135, label: "Real-time vector feedback", color: "#4A5D70" }
    ];
  }

  return { sector, description, transcripts, scenes };
}

// Ingest / Scrape Endpoint Utilizing Playwright/CDP Logic Simulation
app.post("/api/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Competitor URL is required." });
  }

  try {
    let title = "Discovered Competitor Asset";
    let desc = "Extracted media stream from raw competitor source domain.";
    let sector = "General Market";

    // Standard Fallback Ingest if Gemini/Keys are missing
    const fallbackData = getBespokeFallback(url, "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
    let videoId = `discovered-${Date.now()}`;
    let finalStreamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    let finalTranscript = fallbackData.transcripts;
    let finalScenes = fallbackData.scenes;
    let finalDuration = "02:15";
    let finalDurationSec = 135;
    sector = fallbackData.sector;

    let slogan = "";
    let dominantColorPalette = [
      { name: "Onyx", percentage: 80, hex: "#1A1A1A" },
      { name: "Alabaster", percentage: 50, hex: "#F9F9F7" },
      { name: "Slate", percentage: 40, hex: "#4A5D70" },
      { name: "Clay", percentage: 20, hex: "#C47B5F" }
    ];
    let typographyRatios: any = undefined;
    let pacingBeats: any = undefined;

    // If Gemini is available, let's use it to synthesize beautiful metadata for the website!
    try {
      const ai = getGeminiClient();
      const prompt = `You are CURATOR's autonomous competitor archivist AI.
      An analyst has provided the following URL from a competitor: ${url}.
      Invent a realistic high-end brand competitor title and a brilliant summary description of an engineering/strategic video document that would exist on this system.
      Format the response strictly as a JSON object matching the requested schema. Ensure pacingBeats has exactly 4 progression points with descriptions that are a few sentences long.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              sector: { type: Type.STRING },
              slogan: { type: Type.STRING },
              dominantColorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    percentage: { type: Type.INTEGER },
                    hex: { type: Type.STRING }
                  },
                  required: ["name", "percentage", "hex"]
                }
              },
              typographyRatios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ratio: { type: Type.INTEGER }
                  },
                  required: ["name", "ratio"]
                }
              },
              pacingBeats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    name: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    color: { type: Type.STRING }
                  },
                  required: ["time", "name", "desc", "color"]
                }
              }
            },
            required: ["title", "description", "duration", "sector", "slogan", "dominantColorPalette", "typographyRatios", "pacingBeats"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      if (data.title) {
        title = data.title;
        desc = data.description;
        sector = data.sector || sector;
        finalDuration = data.duration || finalDuration;
        const parsedSec = finalDuration.split(":").map(Number);
        finalDurationSec = (parsedSec?.[0] || 3) * 60 + (parsedSec?.[1] || 0);
        if (data.slogan) slogan = data.slogan;
        if (data.dominantColorPalette) dominantColorPalette = data.dominantColorPalette;
        if (data.typographyRatios) typographyRatios = data.typographyRatios;
        if (data.pacingBeats) pacingBeats = data.pacingBeats;
      }
    } catch (err) {
      console.warn("Gemini context setup during scrape bypassed:", err);
    }

    const videoDbKey = process.env.VIDEO_DB_API_KEY || process.env.VIDEODB_API_KEY;
    if (videoDbKey) {
      try {
        console.log(`Connecting to VideoDB to ingest URL: ${url}`);
        const conn = connect({ apiKey: videoDbKey });
        const coll = await conn.getCollection();
        console.log(`Uploading URL to VideoDB...`);
        const video = await coll.uploadURL({ url });
        console.log(`Uploaded URL. Video ID: ${video.id}`);
        
        videoId = video.id;
        finalStreamUrl = video.streamUrl;
        if (video.name) title = video.name;
        if (video.description) desc = video.description;

        console.log(`Indexing spoken words...`);
        await video.indexSpokenWords(undefined, undefined, true);
        
        let sceneIndexId;
        try {
          sceneIndexId = await video.indexScenes({
            prompt: "Describe what's happening in this scene in detail, including actions, text overlays, and settings."
          });
        } catch (sceneErr: any) {
          const match = /id\s+([a-f0-9]+)/.exec(sceneErr.message);
          if (match) {
            sceneIndexId = match[1];
          }
        }

        console.log(`Fetching transcript...`);
        const transcript = await video.getTranscript(undefined, undefined, "sentence");
        if (transcript && transcript.wordTimestamps && transcript.wordTimestamps.length > 0) {
          finalTranscript = transcript.wordTimestamps.map((t: any) => {
            const seconds = Math.floor(t.start);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const time = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            return {
              time,
              seconds,
              text: t.text,
              label: t.speaker ? `Speaker ${t.speaker}` : undefined
            };
          });
        }

        if (sceneIndexId) {
          console.log(`Fetching scenes...`);
          const sceneRecords = await video.getSceneIndex(sceneIndexId);
          if (sceneRecords && sceneRecords.length > 0) {
            const colors = ["#4A5D70", "#C47B5F", "#1A1A1A", "#747878"];
            finalScenes = sceneRecords.map((r: any, idx: number) => ({
              start: Math.floor(r.start),
              end: Math.floor(r.end),
              label: r.description,
              color: colors[idx % colors.length]
            }));
          }
        }

        if (video.length) {
          finalDurationSec = Math.floor(video.length);
          const minutes = Math.floor(video.length / 60);
          const remainingSeconds = Math.floor(video.length % 60);
          finalDuration = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        }
      } catch (videoDbErr) {
        console.error("VideoDB URL upload failed:", videoDbErr);
      }
    }

    const newAsset: VideoAsset = {
      id: videoId,
      title: title,
      description: desc,
      url: url,
      streamUrl: finalStreamUrl,
      duration: finalDuration,
      durationSec: finalDurationSec,
      detectedTime: "Just detected",
      sector: sector,
      brandSentimentScore: Math.floor(Math.random() * 20) - 5,
      dominantColorPalette: dominantColorPalette,
      thematicFocus: [
        { topic: "Scraped Assets", percentage: 70, color: "#1A1C1B" },
        { topic: "Infrastructure", percentage: 30, color: "#4A5D70" }
      ],
      spokenTranscript: finalTranscript,
      visualScenes: finalScenes,
      sceneIndexId: sceneIndexId,
      isImage: false,
      slogan: slogan || undefined,
      typographyRatios: typographyRatios || undefined,
      pacingBeats: pacingBeats || undefined
    };

    competitorArchive.unshift(newAsset);
    res.json({ success: true, asset: newAsset });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Scraping failure" });
  }
});

// Direct Media Local Upload Support / Custom Synthesis Ingest
const uploadFields = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "image", maxCount: 1 }
]);

// Direct Media Local Upload Support / Custom Synthesis Ingest
app.post("/api/upload", uploadFields, async (req, res) => {
  const { title, description, streamUrl, duration, filename, url } = req.body;
  
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const videoFile = files?.["video"]?.[0];
  const imageFile = files?.["image"]?.[0];
  const file = videoFile || imageFile;

  if (!file) {
    return res.status(400).json({ error: "No media file provided." });
  }

  const isImage = !videoFile && !!imageFile;
  
  try {
    const fallbackData = getBespokeFallback(title || filename || file.originalname || "", streamUrl || "");
    let finalTitle = title || filename || file.originalname || "Uploaded Asset";
    let finalDesc = fallbackData.description;
    let finalDuration = duration || "02:40";
    let finalSector = fallbackData.sector;
    let finalTranscript = fallbackData.transcripts;
    let finalScenes = fallbackData.scenes;
    let finalStreamUrl = streamUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    let videoId = `discovered-${Date.now()}`;
    let attachedImageUrl = "";
    let attachedImageAnalysis = "";
    let sceneIndexId: string | undefined;

    let slogan = "";
    let dominantColorPalette = [
      { name: "Onyx", percentage: 70, hex: "#1A1A1A" },
      { name: "Alabaster", percentage: 50, hex: "#F9F9F7" },
      { name: "Slate", percentage: 40, hex: "#4A5D70" },
      { name: "Clay", percentage: 30, hex: "#C47B5F" }
    ];
    let typographyRatios: any = undefined;
    let pacingBeats: any = undefined;

    // If Gemini is available, summarize and draft real-world-like narrative sequences
    try {
      const ai = getGeminiClient();
      let prompt = "";
      let contents: any[] = [];
      
      if (isImage) {
        const base64Data = fs.readFileSync(file.path).toString("base64");
        contents = [
          {
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          },
          `You are CURATOR's autonomous brand intelligence agent.
          The user has uploaded a competitor brand image asset titled: "${finalTitle}".
          Analyze the image design, aesthetic layout, colors, typography, and content.
          Synthesize a high-end description, custom title, slogan, sector, dominant color palette, typography ratios, and pacing beats (invent a simulated video narrative pacing with exactly 4 timeline points and short descriptions).
          Format the response strictly as a JSON object matching the requested schema.`
        ];
      } else {
        prompt = `You are CURATOR's autonomous metadata analyst.
        The analyst has uploaded a local competitor video file named: "${finalTitle}".
        Synthesize a beautiful, highly relevant competitive intelligence transcript, color palette, typography ratios, slogans, and narrative pacing beats (exactly 4 points with short descriptions).
        Format the response strictly as a JSON object matching the requested schema.`;
        contents = [prompt];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              sector: { type: Type.STRING },
              slogan: { type: Type.STRING },
              dominantColorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    percentage: { type: Type.INTEGER },
                    hex: { type: Type.STRING }
                  },
                  required: ["name", "percentage", "hex"]
                }
              },
              typographyRatios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ratio: { type: Type.INTEGER }
                  },
                  required: ["name", "ratio"]
                }
              },
              pacingBeats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    name: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    color: { type: Type.STRING }
                  },
                  required: ["time", "name", "desc", "color"]
                }
              }
            },
            required: ["title", "description", "sector", "slogan", "dominantColorPalette", "typographyRatios", "pacingBeats"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      if (data.title) {
        finalTitle = data.title;
        finalDesc = data.description;
        if (data.duration) finalDuration = data.duration;
        finalSector = data.sector || finalSector;
        if (data.slogan) slogan = data.slogan;
        if (data.dominantColorPalette) dominantColorPalette = data.dominantColorPalette;
        if (data.typographyRatios) typographyRatios = data.typographyRatios;
        if (data.pacingBeats) pacingBeats = data.pacingBeats;
      }
    } catch (err) {
      console.warn("Gemini upload synthesis bypassed or key omitted:", err);
    }

    const videoDbKey = process.env.VIDEO_DB_API_KEY || process.env.VIDEODB_API_KEY;
    if (videoDbKey) {
      try {
        console.log(`Connecting to VideoDB to ingest: ${finalTitle}`);
        const conn = connect({ apiKey: videoDbKey });
        const coll = await conn.getCollection();
        console.log(`Uploading file ${file.path} to VideoDB...`);
        const video = await coll.uploadFile({
          filePath: file.path,
          name: finalTitle
        });
        console.log(`Uploaded asset to VideoDB. ID: ${video.id}`);
        videoId = video.id;
        
        if (isImage) {
          const imgAsset = video as any;
          finalStreamUrl = imgAsset.url || await imgAsset.generateUrl() || "";
          finalDuration = "00:00";
          finalTranscript = [];
          finalScenes = [
            { start: 0, end: 5, label: "Static Brand Image Asset", color: "#4A5D70" }
          ];
        } else {
          finalStreamUrl = video.streamUrl;

          console.log(`Running transcription and scene breakdown on VideoDB...`);
          await video.indexSpokenWords(undefined, undefined, true);
          
          try {
            sceneIndexId = await video.indexScenes({
              prompt: "Describe what's happening in this scene in detail, including actions, text overlays, and settings."
            });
          } catch (sceneErr: any) {
            const match = /id\s+([a-f0-9]+)/.exec(sceneErr.message);
            if (match) {
              sceneIndexId = match[1];
            } else {
              console.error("Failed to index scenes on VideoDB:", sceneErr);
            }
          }

          console.log(`Fetching transcript from VideoDB...`);
          const transcript = await video.getTranscript(undefined, undefined, "sentence");
          if (transcript && transcript.wordTimestamps && transcript.wordTimestamps.length > 0) {
            finalTranscript = transcript.wordTimestamps.map((t: any) => {
              const seconds = Math.floor(t.start);
              const minutes = Math.floor(seconds / 60);
              const remainingSeconds = seconds % 60;
              const time = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
              return {
                time,
                seconds,
                text: t.text,
                label: t.speaker ? `Speaker ${t.speaker}` : undefined
              };
            });
          }

          if (sceneIndexId) {
            console.log(`Fetching scene index from VideoDB...`);
            const sceneRecords = await video.getSceneIndex(sceneIndexId);
            if (sceneRecords && sceneRecords.length > 0) {
              const colors = ["#4A5D70", "#C47B5F", "#1A1A1A", "#747878"];
              finalScenes = sceneRecords.map((r: any, idx: number) => ({
                start: Math.floor(r.start),
                end: Math.floor(r.end),
                label: r.description,
                color: colors[idx % colors.length]
              }));
            }
          }

          if (video.length) {
            const minutes = Math.floor(video.length / 60);
            const remainingSeconds = Math.floor(video.length % 60);
            finalDuration = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
          }
        }

        // Upload and process optional image attachment
        if (!isImage && imageFile) {
          console.log(`Uploading attached image ${imageFile.path} to VideoDB...`);
          const imgAsset = await coll.uploadFile({
            filePath: imageFile.path,
            name: `attachment-${finalTitle}`
          });
          attachedImageUrl = imgAsset.url || await imgAsset.generateUrl() || "";
          console.log(`Uploaded attached image. URL: ${attachedImageUrl}`);

          // Analyze attached image with Gemini
          try {
            const ai = getGeminiClient();
            const base64Data = fs.readFileSync(imageFile.path).toString("base64");
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: [
                {
                  inlineData: {
                    mimeType: imageFile.mimetype,
                    data: base64Data
                  }
                },
                `Analyze this campaign visual art / reference print image associated with the campaign "${finalTitle}". 
                Describe key visual concepts, design elements, color palettes, and themes in a concise, professional paragraph.`
              ]
            });
            attachedImageAnalysis = response.text || "No analysis generated.";
          } catch (geminiErr) {
            console.warn("Failed to analyze attached image with Gemini:", geminiErr);
            attachedImageAnalysis = "Campaign image attachment successfully registered.";
          }
        }
      } catch (videoDbErr) {
        console.error("VideoDB upload or indexing failed, falling back to mock details:", videoDbErr);
      } finally {
        if (videoFile) {
          try { fs.unlinkSync(videoFile.path); } catch {}
        }
        if (imageFile) {
          try { fs.unlinkSync(imageFile.path); } catch {}
        }
      }
    } else {
      // Local fallback simulation when VideoDB key is missing
      if (imageFile) {
        attachedImageUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800";
        attachedImageAnalysis = "Simulated high-contrast editorial campaign key art. Strong lighting with emphasis on minimalist product typography and leather textures.";
        try { fs.unlinkSync(imageFile.path); } catch {}
      }
      if (videoFile) {
        try { fs.unlinkSync(videoFile.path); } catch {}
      }
    }

    const parsedDurationSec = finalDuration.split(":").map(Number);
    const durationSec = (parsedDurationSec?.[0] || 3) * 60 + (parsedDurationSec?.[1] || 0);

    const newAsset: VideoAsset = {
      id: videoId,
      title: finalTitle,
      description: finalDesc,
      url: url || filename || file.originalname || "local-upload",
      streamUrl: finalStreamUrl,
      duration: finalDuration,
      durationSec: durationSec,
      detectedTime: "Just uploaded",
      sector: finalSector,
      brandSentimentScore: Math.floor(Math.random() * 20) - 5,
      dominantColorPalette: dominantColorPalette,
      thematicFocus: [
        { topic: "Strategic Pitch", percentage: 60, color: "#1A1C1B" },
        { topic: "Aesthetic Design", percentage: 40, color: "#C47B5F" }
      ],
      spokenTranscript: finalTranscript,
      visualScenes: finalScenes,
      sceneIndexId: sceneIndexId,
      isImage: isImage,
      attachedImageUrl: attachedImageUrl || undefined,
      attachedImageAnalysis: attachedImageAnalysis || undefined,
      slogan: slogan || undefined,
      typographyRatios: typographyRatios || undefined,
      pacingBeats: pacingBeats || undefined
    };

    competitorArchive.unshift(newAsset);
    res.json({ success: true, asset: newAsset });
  } catch (err: any) {
    console.error("Upload API failed:", err);
    res.status(500).json({ error: err.message || "Upload processing error." });
  }
});

// Cognitive Search Workspace Endpoint (/api/query)
app.post("/api/query", async (req, res) => {
  const { query, activeAssetId } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query parameters are required." });
  }

  // Find target video to query. If none is active, use the first in our database
  const activeAsset = competitorArchive.find(a => a.id === activeAssetId) || competitorArchive[0];

  try {
    let spokenQuery = query;
    let visualQuery = query;
    let timelineMatches: any[] = [];
    let decompositionMethod = "Local Heuristic";

    // Step 1: Query decomposition with Gemini (Optional)
    try {
      const ai = getGeminiClient();
      const prompt = `You are the core Cognitive Search engine for CURATOR.
      Analyze the user's natural language video search query: "${query}".
      Your active video is titled: "${activeAsset.title}" with description: "${activeAsset.description}".
      
      Decompose this query into an intelligent cognitive model. Your response must be a formatted JSON dictionary containing:
      1. 'spoken_query' (synthesized sub-query targeting voice audio)
      2. 'visual_query' (synthesized sub-query targeting physical objects/frames/actions)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              spoken_query: { type: Type.STRING },
              visual_query: { type: Type.STRING }
            },
            required: ["spoken_query", "visual_query"]
          }
        }
      });

      const matchedResult = JSON.parse(response.text?.trim() || "{}");
      if (matchedResult.spoken_query) spokenQuery = matchedResult.spoken_query;
      if (matchedResult.visual_query) visualQuery = matchedResult.visual_query;
      decompositionMethod = "Gemini 3.5 Flash Decomposition";
    } catch (geminiErr: any) {
      console.warn("Gemini query decomposition bypassed or failed, using raw query:", geminiErr.message || geminiErr);
    }

    const videoDbKey = process.env.VIDEO_DB_API_KEY || process.env.VIDEODB_API_KEY;
    
    // Step 2: Query VideoDB spoken and visual indexes if available
    if (!activeAsset.isImage && videoDbKey && activeAsset.id && activeAsset.id.startsWith("m-")) {
      console.log(`Querying VideoDB for active video: ${activeAsset.id}`);
      try {
        const conn = connect({ apiKey: videoDbKey });
        const coll = await conn.getCollection();
        const video = await coll.getVideo(activeAsset.id);

        // A. Spoken Word Search
        try {
          console.log(`Searching spoken index with query: "${spokenQuery}"`);
          const spokenResults = await video.search(spokenQuery, "semantic", "spoken", undefined, 0.3);
          if (spokenResults && spokenResults.shots) {
            spokenResults.shots.forEach((shot: any) => {
              timelineMatches.push({
                start: Math.floor(shot.start),
                end: Math.floor(shot.end),
                text: shot.text,
                match_type: "spoken",
                relevance: `${Math.round((shot.searchScore || 0.9) * 100)}%`
              });
            });
          }
        } catch (spokenErr: any) {
          if (spokenErr.message?.includes("No results found")) {
            console.log("No spoken search matches found.");
          } else {
            console.error("Spoken search failed:", spokenErr);
          }
        }

        // B. Visual Scene Search
        try {
          console.log(`Searching visual scene index with query: "${visualQuery}"`);
          const sceneResults = await video.search(visualQuery, "semantic", "scene", undefined, 0.3);
          if (sceneResults && sceneResults.shots) {
            sceneResults.shots.forEach((shot: any) => {
              timelineMatches.push({
                start: Math.floor(shot.start),
                end: Math.floor(shot.end),
                text: shot.text,
                match_type: "visual",
                relevance: `${Math.round((shot.searchScore || 0.85) * 100)}%`
              });
            });
          }
        } catch (sceneErr: any) {
          if (sceneErr.message?.includes("No results found")) {
            console.log("No visual scene search matches found.");
          } else {
            console.error("Visual scene search failed:", sceneErr);
          }
        }

      } catch (videoDbErr) {
        console.error("VideoDB connection/fetch failed during query:", videoDbErr);
      }
    }

    // Step 3: Heuristic Fallback Search
    if (timelineMatches.length === 0) {
      console.log("Using heuristic fallback search.");
      if (activeAsset.isImage) {
        timelineMatches.push({
          start: 0,
          end: 5,
          text: activeAsset.description || "Static Brand Image Asset",
          match_type: "visual",
          relevance: "100%"
        });
      } else {
        const mockMatches = (activeAsset.spokenTranscript || [])
          .filter(t => t.text.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().split(" ").some(q => t.text.toLowerCase().includes(q)))
          .map(t => ({
            start: Math.max(0, t.seconds - 10),
            end: Math.min(activeAsset.durationSec, t.seconds + 15),
            text: t.text,
            match_type: "spoken",
            relevance: "92%"
          }));

        const mockVisualMatches = (activeAsset.visualScenes || [])
          .filter(s => s.label.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().split(" ").some(q => s.label.toLowerCase().includes(q)))
          .map(s => ({
            start: s.start,
            end: s.end,
            text: s.label,
            match_type: "visual",
            relevance: "85%"
          }));

        timelineMatches = [...mockMatches, ...mockVisualMatches];

        if (timelineMatches.length === 0) {
          timelineMatches.push({
            start: Math.floor(activeAsset.durationSec * 0.1),
            end: Math.min(Math.floor(activeAsset.durationSec * 0.4), activeAsset.durationSec),
            text: `Identified thematic matching zones matching: "${query}" inside key scene parameters.`,
            match_type: "visual",
            relevance: "84%"
          });
        }
      }
    }

    // Sort timeline matches chronologically
    timelineMatches.sort((a, b) => a.start - b.start);

    res.json({
      success: true,
      asset: activeAsset,
      cognitiveDecomposition: {
        spoken_query: spokenQuery,
        visual_query: visualQuery,
        method: decompositionMethod
      },
      timelineMatches
    });
  } catch (error: any) {
    console.error("Query API failed:", error);
    res.status(500).json({ error: error.message || "Failed to parse cognitive search layout." });
  }
});

// Competitor Lists / Archive Endpoint
app.get("/api/videos", (req, res) => {
  res.json({ success: true, videos: competitorArchive });
});

// Reports & Infographics Synthesis Endpoint (/api/reports)
app.get("/api/reports-summary", async (req, res) => {
  try {
    try {
      const ai = getGeminiClient();
      const prompt = `You areCURATOR's chief design synthesister & market analyst utilizing SenseNova U1 systems.
      Compile a high-end, elegant infographics data structure highlighting brand shifts, typography uses, dominant color codes, and competitive claims.
      Your analysis should reference the following active competitor assets: ${JSON.stringify(competitorArchive)}.
      Produce a gorgeous JSON output summarizing trends. Ensure formatting is perfect JSON containing:
      1. 'sentimentTrend' (array of 4 items with name e.g. "Week 1", 'CompetitorScore' e.g. 50, 'TargetScore' e.g. 80)
      2. 'dominantPalettes' (array of 4 items with name, value (percentage), color (Hex code))
      3. 'typographyRatios' (array of 2 items with name e.g. "Serif", 'ratio' e.g. 68)
      4. 'pacingBeats' (array of 4 items with time e.g. "0:00", name e.g. "The Hook", desc e.g. "Macro focus", color e.g. "#1A1A1A")
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentimentTrend: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    competitorVal: { type: Type.INTEGER },
                    targetVal: { type: Type.INTEGER }
                  },
                  required: ["name", "competitorVal", "targetVal"]
                }
              },
              dominantPalettes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.INTEGER },
                    color: { type: Type.STRING }
                  },
                  required: ["name", "value", "color"]
                }
              },
              typographyRatios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ratio: { type: Type.INTEGER }
                  },
                  required: ["name", "ratio"]
                }
              },
              pacingBeats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    name: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    color: { type: Type.STRING }
                  },
                  required: ["time", "name", "desc", "color"]
                }
              }
            },
            required: ["sentimentTrend", "dominantPalettes", "typographyRatios", "pacingBeats"]
          }
        }
      });

      const parsedReports = JSON.parse(response.text?.trim() || "{}");
      return res.json({ success: true, data: parsedReports });
    } catch (e) {
      console.error("SenseNova integration was bypassed or key omitted:", e);
    }

    // Default High-Fidelity Infographics fallback data in sync with Google Stitch Mockups
    res.json({
      success: true,
      data: {
        sentimentTrend: [
          { name: "Week 1", competitorVal: 10, targetVal: 20 },
          { name: "Week 2", competitorVal: 15, targetVal: 40 },
          { name: "Week 3", competitorVal: 12, targetVal: 80 },
          { name: "Week 4", competitorVal: 22, targetVal: 95 }
        ],
        dominantPalettes: [
          { name: "Onyx Black", value: 85, color: "#1A1A1A" },
          { name: "Alabaster White", value: 60, color: "#F9F9F7" },
          { name: "Slate Blue", value: 45, color: "#4A5D70" },
          { name: "Muted Clay", value: 20, color: "#C47B5F" }
        ],
        typographyRatios: [
          { name: "Serif (Playfair Display)", ratio: 68 },
          { name: "Sans-Serif (Inter)", ratio: 32 }
        ],
        pacingBeats: [
          { time: "0:00", name: "The Hook", desc: "Macro product shot detailing precise alignments.", color: "#1A1A1A" },
          { time: "0:08", name: "Context Integration", desc: "Atmospheric workspace and lifestyle layout.", color: "#4A5D70" },
          { time: "0:18", name: "Feature Highlight", desc: "Kinetic typography overlay detailing telemetry.", color: "#747878" },
          { time: "0:26", name: "The Call", desc: "High-contrast brand lockup and aesthetic sign-off.", color: "#C47B5F" }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to compile analytical data." });
  }
});

// Local Runtime Monitor and Keys Monitor Endpoint
app.get("/api/runtime-status", (req, res) => {
  res.json({
    success: true,
    keysActive: {
      gemini: !!process.env.GEMINI_API_KEY,
      brightData: !!process.env.BRIGHT_DATA_CDP,
      videoDb: !!process.env.VIDEO_DB_API_KEY,
      moonshot: !!process.env.MOONSHOT_API_KEY,
      senseNova: !!process.env.SENSENOVA_API_KEY,
    },
    quota: {
      totalCredits: 50,
      creditsConsumed: 18.2,
      estimatedCost: "$3.64",
      cachingSavings: "84.5%",
      cacheHitRatio: "0.89",
      contextCachingEfficiency: "91.2%"
    }
  });
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Curator Server online and bound to host 0.0.0.0 on port ${PORT}`);
  });
}

startServer();
