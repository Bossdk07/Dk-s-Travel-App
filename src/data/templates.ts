export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  imageCount: number;
  html: string;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "hero-showcase",
    name: "Architectural Editorial Hero",
    category: "Landing Page",
    description: "High-impact layout with hotlinked high-resolution architectural photography, overlay captions, and responsive layout.",
    imageCount: 3,
    html: `<div class="max-w-4xl mx-auto p-8 bg-[#131722] text-slate-100 rounded-2xl border border-white/10 shadow-2xl font-sans">
  <div class="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-white/5 pb-4">
    <span class="tracking-widest uppercase font-semibold text-blue-400">Architecture & Design</span>
    <span>Vol. 42 · Spring Issue</span>
  </div>

  <h1 class="text-4xl font-bold tracking-tight text-white mb-4">
    The Monolithic Concrete Pavilion
  </h1>
  <p class="text-slate-400 text-sm max-w-2xl leading-relaxed mb-6">
    Exploring brutalist curves and serene natural daylight illumination in minimalist structures across northern latitudes.
  </p>

  <!-- Primary Hotlinked Hero Asset -->
  <div class="relative overflow-hidden rounded-xl border border-white/10 group mb-6">
    <img 
      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80" 
      alt="Modern Concrete Villa Exterior at Golden Hour" 
      loading="lazy" 
      decoding="async" 
      referrerpolicy="no-referrer" 
      class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" 
    />
    <div class="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[11px] text-white/90">
      Photo via Unsplash Hotlink
    </div>
  </div>

  <!-- Supporting Twin Hotlinked Assets -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-center">
      <img 
        src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" 
        alt="Interior Minimalist Lighting" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-20 h-20 rounded-lg object-cover shrink-0" 
      />
      <div>
        <h3 class="text-sm font-semibold text-white">Interior Light Studies</h3>
        <p class="text-xs text-slate-400 mt-1">Diffused morning sunlight cast over travertine floors.</p>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-center">
      <img 
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" 
        alt="Sleek Minimalist Facade" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-20 h-20 rounded-lg object-cover shrink-0" 
      />
      <div>
        <h3 class="text-sm font-semibold text-white">Facade Cantilevers</h3>
        <p class="text-xs text-slate-400 mt-1">Pre-stressed reinforced beams spanning over courtyard ponds.</p>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "product-gallery",
    name: "Luxury Watch E-Commerce Card",
    category: "E-Commerce",
    description: "Multi-angle product showcase with hotlinked macro photography and specs.",
    imageCount: 4,
    html: `<div class="max-w-md mx-auto p-6 bg-[#0F121A] text-slate-200 rounded-2xl border border-white/10 shadow-xl font-sans">
  <div class="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Horology Series</div>
  <h2 class="text-2xl font-bold text-white mb-1">Chronograph Aero-1</h2>
  <p class="text-xs text-slate-400 mb-4">Grade 5 Titanium · Automatic Calibre · 100m Water Resistant</p>

  <!-- Main Feature Image -->
  <div class="relative rounded-xl overflow-hidden bg-slate-900/60 border border-white/10 mb-4">
    <img 
      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" 
      alt="Luxury Chronograph Watch Front View" 
      loading="lazy" 
      decoding="async" 
      referrerpolicy="no-referrer" 
      class="w-full h-64 object-cover" 
    />
  </div>

  <!-- Hotlinked Thumbnail Row -->
  <div class="grid grid-cols-3 gap-2 mb-6">
    <img 
      src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80" 
      alt="Dial Macro Detail" 
      loading="lazy" 
      decoding="async" 
      referrerpolicy="no-referrer" 
      class="w-full h-16 object-cover rounded-lg border border-amber-500/50" 
    />
    <img 
      src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=300&q=80" 
      alt="Caseback & Rotor Detail" 
      loading="lazy" 
      decoding="async" 
      referrerpolicy="no-referrer" 
      class="w-full h-16 object-cover rounded-lg border border-white/10 hover:border-white/30 transition-colors" 
    />
    <img 
      src="https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=300&q=80" 
      alt="Crown and Pushers Close Up" 
      loading="lazy" 
      decoding="async" 
      referrerpolicy="no-referrer" 
      class="w-full h-16 object-cover rounded-lg border border-white/10 hover:border-white/30 transition-colors" 
    />
  </div>

  <div class="flex items-center justify-between pt-4 border-t border-white/10">
    <div>
      <span class="text-xs text-slate-400">Retail Price</span>
      <div class="text-xl font-bold text-white">$4,850</div>
    </div>
    <button class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide transition-colors">
      Acquire Timepiece
    </button>
  </div>
</div>`
  },
  {
    id: "masonry-art",
    name: "Nature & Wildlife Photo Grid",
    category: "Photography",
    description: "Responsive gallery with diverse aspect ratios hotlinking natural landscapes and fauna.",
    imageCount: 4,
    html: `<div class="max-w-4xl mx-auto p-6 bg-[#0E1118] text-white rounded-2xl border border-white/10 font-sans">
  <div class="mb-6">
    <h2 class="text-2xl font-bold">Wild Earth Chronicles</h2>
    <p class="text-xs text-slate-400 mt-1">Live hotlinked visual dispatches from remote geographic expeditions.</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1 -->
    <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
      <img 
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" 
        alt="Yosemite Valley Mist at Sunrise" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div class="p-3">
        <h4 class="text-xs font-semibold">Alpine Glacial Valley</h4>
        <span class="text-[10px] text-slate-400">California, USA</span>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
      <img 
        src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80" 
        alt="Aurora Borealis over Snow Peaks" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div class="p-3">
        <h4 class="text-xs font-semibold">Northern Lights Ridge</h4>
        <span class="text-[10px] text-slate-400">Tromsø, Norway</span>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
      <img 
        src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80" 
        alt="Iceland Volcanic Black Sand Beach" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div class="p-3">
        <h4 class="text-xs font-semibold">Basalt Sea Stacks</h4>
        <span class="text-[10px] text-slate-400">Vik, Iceland</span>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
      <img 
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80" 
        alt="Misty Forest Morning Foliage" 
        loading="lazy" 
        decoding="async" 
        referrerpolicy="no-referrer" 
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div class="p-3">
        <h4 class="text-xs font-semibold">Ancient Redwoods</h4>
        <span class="text-[10px] text-slate-400">Pacific Northwest</span>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "user-avatars-team",
    name: "Collaborative Team Cards",
    category: "Components",
    description: "Compact UI avatars with online indicators and profile cards using hotlinked portrait photos.",
    imageCount: 3,
    html: `<div class="max-w-md mx-auto p-6 bg-[#11141D] text-slate-200 rounded-2xl border border-white/10 font-sans">
  <h3 class="text-base font-semibold text-white mb-4">Core Engineering Leads</h3>
  
  <div class="space-y-3">
    <div class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
            alt="Elena Vance Avatar" 
            loading="lazy" 
            decoding="async" 
            referrerpolicy="no-referrer" 
            class="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50" 
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#11141D]"></span>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-white">Elena Vance</h4>
          <span class="text-xs text-slate-400">Distributed Systems Lead</span>
        </div>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">Active</span>
    </div>

    <div class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" 
            alt="Marcus Chen Avatar" 
            loading="lazy" 
            decoding="async" 
            referrerpolicy="no-referrer" 
            class="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/50" 
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#11141D]"></span>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-white">Marcus Chen</h4>
          <span class="text-xs text-slate-400">Computer Vision Specialist</span>
        </div>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">Active</span>
    </div>

    <div class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" 
            alt="Sophia Reynolds Avatar" 
            loading="lazy" 
            decoding="async" 
            referrerpolicy="no-referrer" 
            class="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50" 
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[#11141D]"></span>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-white">Sophia Reynolds</h4>
          <span class="text-xs text-slate-400">Frontend Performance Architect</span>
        </div>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">Away</span>
    </div>
  </div>
</div>`
  }
];
