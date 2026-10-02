import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Image Proxy & Header Inspector Endpoint
app.get("/api/inspect-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).json({ error: "Missing image url" });
  }

  try {
    const startTime = Date.now();
    const fetchRes = await fetch(imageUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    const latency = Date.now() - startTime;
    const contentType = fetchRes.headers.get("content-type") || "unknown";
    const contentLength = fetchRes.headers.get("content-length");
    const cacheControl = fetchRes.headers.get("cache-control") || "none";
    const cors = fetchRes.headers.get("access-control-allow-origin") || "none";

    res.json({
      url: imageUrl,
      status: fetchRes.status,
      statusText: fetchRes.statusText,
      contentType,
      contentLength: contentLength ? parseInt(contentLength, 10) : null,
      cacheControl,
      cors,
      latencyMs: latency,
      isImage: contentType.startsWith("image/"),
    });
  } catch (err: any) {
    res.status(500).json({
      url: imageUrl,
      status: 0,
      error: err.message || "Failed to inspect hotlink",
    });
  }
});

// Proxy Image Stream to bypass strict Referrer or CORS blocking
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("Missing image url");
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": req.query.customReferer ? String(req.query.customReferer) : new URL(imageUrl).origin,
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream image error: ${upstream.statusText}`);
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send("Failed to proxy image: " + err.message);
  }
});

// AI HTML Generation & Hotlink Optimizer
app.post("/api/ai-html-enrich", async (req, res) => {
  const { prompt = "", html = "", action = "generate" } = req.body || {};
  const ai = getAiClient();

  if (!ai) {
    return res.json({
      html: html || `<div class="card p-6 bg-slate-900 rounded-2xl text-white">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
       alt="Abstract Fluid Art" 
       loading="lazy" 
       decoding="async" 
       referrerpolicy="no-referrer" 
       class="w-full h-64 object-cover rounded-xl shadow-lg" />
  <h2 class="text-xl font-bold mt-4">Hotlinked Masterpiece</h2>
  <p class="text-sm text-slate-400 mt-1">Rendered dynamically via LinkForge.</p>
</div>`,
      summary: "AI Key not configured; returned high-performance modern hotlinked template.",
    });
  }

  try {
    const systemPrompt = `You are LinkForge AI, an expert frontend engineer specializing in HTML markup, hotlinked imagery, responsive <picture> tags, modern CSS/Tailwind, and web performance.
Task: ${action === "optimize" ? "Audit and optimize the provided HTML with modern loading='lazy', decoding='async', referrerpolicy='no-referrer', semantic alt tags, and responsive container styling." : "Generate pristine, modern HTML with real hotlinked high-resolution image URLs (using reliable CDN URLs like Unsplash, Wikimedia, or Googleusercontent) based on the user's prompt."}
Return ONLY valid HTML source code without markdown fences or backticks.`;

    const contents = action === "optimize"
      ? `Optimize this HTML for performance and hotlinking:\n\n${html}`
      : `Generate modern HTML for: ${prompt}\nInclude high-quality hotlinked images with descriptive alt tags and responsive CSS classes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    let generatedHtml = response.text || "";
    // Clean up code block markdown if present
    generatedHtml = generatedHtml.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    res.json({
      html: generatedHtml,
      summary: "HTML successfully processed and enriched with hotlinked assets.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process HTML with AI" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LinkForge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
