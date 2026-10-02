import React, { useState, useEffect } from "react";
import { ExtractedImage } from "../utils/htmlParser";
import { X, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, RefreshCw, Layers } from "lucide-react";

interface ImageDetailModalProps {
  image: ExtractedImage | null;
  onClose: () => void;
}

interface ServerInspection {
  status?: number;
  statusText?: string;
  contentType?: string;
  contentLength?: number | null;
  cacheControl?: string;
  cors?: string;
  latencyMs?: number;
  isImage?: boolean;
  error?: string;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ image, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isCheckered, setIsCheckered] = useState<boolean>(true);
  const [useProxy, setUseProxy] = useState<boolean>(false);
  const [serverData, setServerData] = useState<ServerInspection | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  useEffect(() => {
    if (!image) {
      setServerData(null);
      setNaturalSize(null);
      setUseProxy(false);
      return;
    }

    if (!image.isDataUri) {
      setIsInspecting(true);
      fetch(`/api/inspect-image?url=${encodeURIComponent(image.src)}`)
        .then((res) => res.json())
        .then((data) => setServerData(data))
        .catch((err) => setServerData({ error: err.message }))
        .finally(() => setIsInspecting(false));
    }
  }, [image]);

  if (!image) return null;

  const currentDisplayUrl = useProxy && !image.isDataUri
    ? `/api/proxy-image?url=${encodeURIComponent(image.src)}`
    : image.src;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "Unknown / Streaming";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const aspectRatio = naturalSize
    ? (naturalSize.width / naturalSize.height).toFixed(2)
    : "Analyzing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#131722] border border-white/10 rounded-2xl shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
              <span>{image.domain}</span>
              <span>·</span>
              <span>{image.elementTag.toUpperCase()}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5 truncate max-w-xl">
              {image.alt || "Hotlinked Visual Asset"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Visual Preview Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0B0D13] flex flex-col items-center justify-center min-h-[260px] max-h-[380px] p-4">
            <div className={isCheckered ? "checkered-canvas absolute inset-0 opacity-40" : "absolute inset-0 bg-[#0B0D13]"} />
            
            <img
              src={currentDisplayUrl}
              alt={image.alt}
              referrerPolicy={image.hasNoReferrer ? "no-referrer" : undefined}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
              }}
              className="relative max-h-[320px] max-w-full object-contain rounded shadow-lg z-10"
            />

            {/* Canvas Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => setIsCheckered(!isCheckered)}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border transition-colors cursor-pointer ${
                  isCheckered
                    ? "bg-white/20 text-white border-white/20"
                    : "bg-black/60 text-slate-300 border-white/10"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Checkered BG</span>
              </button>

              {!image.isDataUri && (
                <button
                  type="button"
                  onClick={() => setUseProxy(!useProxy)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border transition-colors cursor-pointer ${
                    useProxy
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-black/60 text-slate-300 border-white/10 hover:text-white"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{useProxy ? "Direct Mode" : "Bypass CORS Proxy"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-1">Natural Dimensions</span>
              <span className="font-mono font-semibold text-white">
                {naturalSize ? `${naturalSize.width} × ${naturalSize.height} px` : "Measuring..."}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-1">Aspect Ratio</span>
              <span className="font-mono font-semibold text-white">
                {aspectRatio} : 1
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-1">File Size</span>
              <span className="font-mono font-semibold text-white">
                {serverData ? formatBytes(serverData.contentLength) : "Checking..."}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-1">Server Latency</span>
              <span className="font-mono font-semibold text-emerald-400">
                {serverData?.latencyMs ? `${serverData.latencyMs} ms` : "—"}
              </span>
            </div>
          </div>

          {/* Upstream Server Header Inspector */}
          {!image.isDataUri && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Upstream HTTP Header Diagnostic</span>
                </span>
                {isInspecting ? (
                  <span className="text-blue-400">Inspecting headers...</span>
                ) : serverData?.status ? (
                  <span className={`font-mono font-bold ${serverData.status === 200 ? "text-emerald-400" : "text-amber-400"}`}>
                    HTTP {serverData.status} {serverData.statusText}
                  </span>
                ) : null}
              </div>

              {serverData && !serverData.error ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                  <div>Content-Type: <span className="text-white">{serverData.contentType}</span></div>
                  <div>Cache-Control: <span className="text-white truncate">{serverData.cacheControl}</span></div>
                  <div>CORS Header: <span className="text-white">{serverData.cors}</span></div>
                  <div>HTTPS Secured: <span className="text-emerald-400">{image.isHttps ? "Yes (TLS)" : "No (Insecure HTTP)"}</span></div>
                </div>
              ) : serverData?.error ? (
                <div className="text-xs text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverData.error}</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Copy Snippets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hotlink Snippets for Embed
            </h3>

            <div className="space-y-2">
              {/* Direct Link */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="font-mono text-slate-300 truncate max-w-lg">{image.src}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(image.src, "url")}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedKey === "url" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={image.src}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Open original in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Optimized img tag */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="font-mono text-slate-300 truncate max-w-lg">
                  {`<img src="${image.src}" alt="${image.alt || "Hotlinked visual asset"}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `<img src="${image.src}" alt="${image.alt || "Hotlinked visual asset"}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`,
                      "img"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedKey === "img" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "img" ? "Copied" : "Copy Tag"}</span>
                </button>
              </div>

              {/* Markdown Syntax */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="font-mono text-slate-300 truncate max-w-lg">
                  {`![${image.alt || "Image"}](${image.src})`}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`![${image.alt || "Image"}](${image.src})`, "md")}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy Markdown"
                >
                  {copiedKey === "md" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
