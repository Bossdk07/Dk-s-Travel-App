import React, { useState, useMemo, useRef, useEffect } from "react";
import { TEMPLATE_PRESETS, TemplatePreset } from "./data/templates";
import { extractImagesFromHtml, optimizeHtmlHotlinks, ExtractedImage } from "./utils/htmlParser";
import { ImageDetailModal } from "./components/ImageDetailModal";
import { HotlinkGallery } from "./components/HotlinkGallery";
import { HealthAuditView } from "./components/HealthAuditView";
import {
  Code,
  Eye,
  Layers,
  ShieldCheck,
  Wrench,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  ChevronDown,
  Info,
  Loader2,
  Trash2,
  Download,
  Terminal
} from "lucide-react";

export default function App() {
  const [htmlCode, setHtmlCode] = useState<string>(TEMPLATE_PRESETS[0].html);
  const [activeTab, setActiveTab] = useState<"preview" | "gallery" | "audit">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [showAiBar, setShowAiBar] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Parse images whenever HTML changes
  const extractedImages = useMemo(() => {
    return extractImagesFromHtml(htmlCode);
  }, [htmlCode]);

  // Update iframe preview document
  useEffect(() => {
    if (activeTab !== "preview") return;

    const frame = previewFrameRef.current;
    if (!frame) return;

    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background-color: #0b0d13;
      color: #e4e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>`);
    doc.close();
  }, [htmlCode, activeTab, deviceMode]);

  const handleApplyAutoFix = () => {
    const { optimizedHtml, fixesCount } = optimizeHtmlHotlinks(htmlCode);
    setHtmlCode(optimizedHtml);
    triggerToast(`Auto-optimized ${fixesCount} hotlink attributes (lazy, no-referrer, async)`);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedKey("html");
    setTimeout(() => setCopiedKey(null), 2000);
    triggerToast("HTML copied to clipboard");
  };

  const handleSelectTemplate = (tmpl: TemplatePreset) => {
    setHtmlCode(tmpl.html);
    triggerToast(`Loaded "${tmpl.name}"`);
  };

  const handleAiGenerate = async (action: "generate" | "optimize" = "generate") => {
    if (action === "generate" && !aiPrompt.trim()) return;

    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai-html-enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          html: htmlCode,
          action,
        }),
      });
      const data = await res.json();
      if (data.html) {
        setHtmlCode(data.html);
        triggerToast("HTML generated & hotlinks rendered successfully");
        setAiPrompt("");
        setShowAiBar(false);
      }
    } catch {
      triggerToast("Failed to connect to AI generator; fallback preserved.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleExportHtmlFile = () => {
    const blob = new Blob([htmlCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkforge-hotlinked-document.html";
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("Downloaded HTML file");
  };

  const getDeviceWidthClass = () => {
    switch (deviceMode) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B0D13] text-[#E4E7EB] overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-14 border-b border-white/10 bg-[#11141E] px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              LF
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Link<span className="text-blue-400">Forge</span>
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400 ml-2 font-mono">
                HTML Hotlink Studio
              </span>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="relative group">
            <select
              aria-label="Preset Template"
              onChange={(e) => {
                const found = TEMPLATE_PRESETS.find((p) => p.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none pr-8"
            >
              {TEMPLATE_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#11141E] text-white">
                  Template: {p.name} ({p.imageCount} imgs)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Extracted Counter Tag */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>{extractedImages.length} Hotlinks Rendered</span>
          </span>

          <button
            type="button"
            onClick={() => setShowAiBar(!showAiBar)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAiBar
                ? "bg-blue-600 text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Hotlink Assistant</span>
          </button>

          <button
            type="button"
            onClick={handleApplyAutoFix}
            title="Inject referrerpolicy, lazy loading, and async decoding"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Auto-Fix Hotlinks</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {copiedKey === "html" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "html" ? "Copied" : "Copy HTML"}</span>
          </button>
        </div>
      </header>

      {/* OPTIONAL AI PROMPT EXPANDABLE DRAWER */}
      {showAiBar && (
        <div className="p-3 bg-[#161B28] border-b border-white/10 flex flex-col sm:flex-row items-center gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate HTML with Hotlinked Images:</span>
          </div>

          <input
            type="text"
            placeholder="e.g. Minimalist recipe card with hotlinked strawberry tart photo and ingredients..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiGenerate("generate");
            }}
            className="flex-1 w-full bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={isAiGenerating || !aiPrompt.trim()}
              onClick={() => handleAiGenerate("generate")}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
              <span>{isAiGenerating ? "Generating..." : "Generate Code"}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN DUAL-PANE WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: HTML SOURCE CODE EDITOR */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0E1119]">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 border-b border-white/10 bg-[#121622] flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white font-semibold">HTML Source Code</span>
              <span className="text-slate-500">·</span>
              <span>{htmlCode.length} chars</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHtmlCode("")}
                className="hover:text-red-400 p-1 transition-colors cursor-pointer"
                title="Clear code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleExportHtmlFile}
                className="hover:text-white p-1 transition-colors cursor-pointer"
                title="Download .html file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Textarea with Line Numbers */}
          <div className="flex-1 relative overflow-hidden flex">
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="Paste HTML source code with <img>, <picture>, or background-image URLs here..."
              spellCheck={false}
              aria-label="HTML Source Code Editor"
              className="w-full h-full p-4 bg-transparent text-slate-200 font-mono-code text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 overflow-y-auto selection:bg-blue-600 selection:text-white"
            />
          </div>

          {/* Editor Status Bar */}
          <div className="h-8 px-4 border-t border-white/10 bg-[#11141E] flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">● Live Hotlink Parser Active</span>
              <span>UTF-8</span>
            </div>
            <div>
              <span>{extractedImages.length} Image tags found</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: CANVAS & EXTRACTED HOTLINK TOOLS */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-[#0B0D13]">
          {/* Tab Navigation Header */}
          <div className="h-10 px-4 border-b border-white/10 bg-[#121622] flex items-center justify-between shrink-0">
            {/* View Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Render</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gallery")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "gallery"
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Assets Gallery ({extractedImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safety & Audit</span>
              </button>
            </div>

            {/* Device Viewport Toggle (Only in Preview Tab) */}
            {activeTab === "preview" && (
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setDeviceMode("desktop")}
                  title="Desktop View (100%)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    deviceMode === "desktop" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode("tablet")}
                  title="Tablet View (768px)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    deviceMode === "tablet" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode("mobile")}
                  title="Mobile View (375px)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    deviceMode === "mobile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* TAB 1: LIVE RENDER PREVIEW */}
            {activeTab === "preview" && (
              <div className="w-full h-full p-4 flex items-center justify-center bg-[#07090E] overflow-auto">
                <div
                  className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B0D13] ${getDeviceWidthClass()}`}
                >
                  <iframe
                    ref={previewFrameRef}
                    title="Live Hotlinked HTML Canvas"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0 bg-[#0B0D13]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: HOTLINK ASSETS GALLERY */}
            {activeTab === "gallery" && (
              <HotlinkGallery
                images={extractedImages}
                onSelectImage={(img) => setSelectedImage(img)}
              />
            )}

            {/* TAB 3: SAFETY & PERFORMANCE AUDIT */}
            {activeTab === "audit" && (
              <HealthAuditView
                images={extractedImages}
                onApplyAutoFix={handleApplyAutoFix}
              />
            )}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL IMAGE DETAIL INSPECTOR MODAL */}
      <ImageDetailModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
