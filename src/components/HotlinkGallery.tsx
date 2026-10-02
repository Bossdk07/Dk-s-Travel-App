import React, { useState } from "react";
import { ExtractedImage } from "../utils/htmlParser";
import { Copy, Check, ExternalLink, Info, AlertTriangle, ShieldCheck, Search } from "lucide-react";

interface HotlinkGalleryProps {
  images: ExtractedImage[];
  onSelectImage: (img: ExtractedImage) => void;
}

export const HotlinkGallery: React.FC<HotlinkGalleryProps> = ({ images, onSelectImage }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const domains = Array.from(new Set(images.map((i) => i.domain)));

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.src.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.alt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = filterDomain === "all" || img.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const handleCopyUrl = (src: string, id: string) => {
    navigator.clipboard.writeText(src);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAllUrls = () => {
    const all = images.map((i) => i.src).join("\n");
    navigator.clipboard.writeText(all);
    setCopiedId("all-urls");
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
        <Info className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-200">No Hotlinked Images Detected</h3>
        <p className="text-xs max-w-sm">
          Type or paste HTML code containing &lt;img&gt;, &lt;picture&gt;, or CSS background-images in the editor.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0D0F16]">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#111520]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by alt text or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All CDNs ({images.length})</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAllUrls}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedId === "all-urls" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === "all-urls" ? "Copied All" : `Copy All URLs (${images.length})`}</span>
          </button>
        </div>
      </div>

      {/* Grid of Images */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelectImage(img)}
            className="group rounded-xl border border-white/10 bg-[#141824] hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Visual Thumbnail */}
            <div className="relative h-44 bg-[#0B0D13] overflow-hidden flex items-center justify-center">
              <div className="checkered-canvas absolute inset-0 opacity-20" />
              <img
                src={img.src}
                alt={img.alt || "Hotlinked preview"}
                referrerPolicy={img.hasNoReferrer ? "no-referrer" : undefined}
                className="relative max-h-full max-w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 backdrop-blur-md text-slate-300">
                  {img.domain}
                </span>
              </div>

              {!img.isHttps && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/80 text-black flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>HTTP Insecure</span>
                </div>
              )}
            </div>

            {/* Meta Footer */}
            <div className="p-3.5 space-y-2 border-t border-white/5">
              <h4 className="text-xs font-semibold text-white truncate" title={img.alt || img.src}>
                {img.alt || "(No Alt Text)"}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 truncate" title={img.src}>
                {img.src}
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={img.hasNoReferrer ? "text-emerald-400" : "text-slate-500"}>
                    {img.hasNoReferrer ? "No-Referrer" : "Standard Referrer"}
                  </span>
                  <span>·</span>
                  <span className={img.hasLazyLoading ? "text-blue-400" : "text-slate-500"}>
                    {img.hasLazyLoading ? "Lazy" : "Eager"}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(img.src, img.id)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={img.src}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Open original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
