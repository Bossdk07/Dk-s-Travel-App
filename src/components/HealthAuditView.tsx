import React from "react";
import { ExtractedImage } from "../utils/htmlParser";
import { ShieldCheck, AlertTriangle, CheckCircle2, Wrench, Sparkles, HelpCircle } from "lucide-react";

interface HealthAuditViewProps {
  images: ExtractedImage[];
  onApplyAutoFix: () => void;
}

export const HealthAuditView: React.FC<HealthAuditViewProps> = ({ images, onApplyAutoFix }) => {
  const total = images.length;
  if (total === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
        <HelpCircle className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-200">No Assets to Audit</h3>
        <p className="text-xs">Add HTML code with hotlinked images to view security & performance diagnostics.</p>
      </div>
    );
  }

  const httpsCount = images.filter((i) => i.isHttps).length;
  const altCount = images.filter((i) => i.hasAlt).length;
  const lazyCount = images.filter((i) => i.hasLazyLoading).length;
  const noReferrerCount = images.filter((i) => i.hasNoReferrer).length;

  const httpsPercent = Math.round((httpsCount / total) * 100);
  const altPercent = Math.round((altCount / total) * 100);
  const lazyPercent = Math.round((lazyCount / total) * 100);
  const noReferrerPercent = Math.round((noReferrerCount / total) * 100);

  const overallScore = Math.round((httpsPercent + altPercent + lazyPercent + noReferrerPercent) / 4);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#0D0F16] text-slate-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400">
            Hotlink Performance & Safety Score
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-bold font-mono text-white">{overallScore}</span>
            <span className="text-xs text-slate-400">/ 100 Quality Index</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Auditing hotlinked images for CDN referrer blocks, mixed content (HTTP), and Core Web Vitals optimizations.
          </p>
        </div>

        <button
          type="button"
          onClick={onApplyAutoFix}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-lg shadow-blue-500/20"
        >
          <Wrench className="w-4 h-4" />
          <span>Apply Auto-Fix to HTML</span>
        </button>
      </div>

      {/* 4 Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 1: Referrer Policy */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">CDN Anti-Hotlink Protection (No-Referrer)</span>
            <span className={`text-xs font-mono font-bold ${noReferrerPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {noReferrerCount}/{total} ({noReferrerPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Prevents upstream hosts (e.g. Unsplash, Wikimedia) from rejecting requests with 403 Forbidden.
          </p>
        </div>

        {/* Metric 2: HTTPS Transport */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">HTTPS Secure Transport</span>
            <span className={`text-xs font-mono font-bold ${httpsPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {httpsCount}/{total} ({httpsPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ensures assets do not trigger mixed-content security warnings on modern browsers.
          </p>
        </div>

        {/* Metric 3: Accessibility Alt Text */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Accessibility (alt tags)</span>
            <span className={`text-xs font-mono font-bold ${altPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {altCount}/{total} ({altPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Mandatory for screen readers and SEO indexing of hotlinked imagery.
          </p>
        </div>

        {/* Metric 4: Lazy Loading */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Lazy Loading (loading="lazy")</span>
            <span className={`text-xs font-mono font-bold ${lazyPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {lazyCount}/{total} ({lazyPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Defers off-screen image fetching to keep initial page load fast and save data.
          </p>
        </div>
      </div>

      {/* Flagged Issues List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Issues & Recommendations</h4>
        <div className="space-y-2">
          {images.map((img) => {
            const issues: string[] = [];
            if (!img.hasNoReferrer) issues.push("Missing referrerpolicy='no-referrer'");
            if (!img.hasLazyLoading) issues.push("Missing loading='lazy'");
            if (!img.hasAlt) issues.push("Missing alt text");
            if (!img.isHttps) issues.push("Insecure HTTP protocol");

            if (issues.length === 0) return null;

            return (
              <div key={img.id} className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="truncate max-w-md">
                  <span className="font-mono text-slate-300 truncate block">{img.src}</span>
                  <span className="text-[11px] text-slate-500">{img.alt || "(No Alt Tag)"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {issues.map((iss, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {iss}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
