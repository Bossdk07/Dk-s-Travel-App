export interface ExtractedImage {
  id: string;
  src: string;
  alt: string;
  elementTag: "img" | "picture-source" | "css-bg" | "svg-image" | "markdown";
  loadingAttr?: string;
  decodingAttr?: string;
  referrerPolicy?: string;
  width?: string;
  height?: string;
  className?: string;
  domain: string;
  isHttps: boolean;
  isDataUri: boolean;
  hasAlt: boolean;
  hasLazyLoading: boolean;
  hasNoReferrer: boolean;
  rawSnippet: string;
}

export function extractImagesFromHtml(html: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const seenUrls = new Set<string>();

  if (!html || typeof html !== "string") return images;

  // 1. Match <img> tags
  const imgRegex = /<img\s+([^>]*?)>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const rawSnippet = match[0];
    const attrsString = match[1];

    const srcMatch = /src\s*=\s*["']([^"']+)["']/i.exec(attrsString);
    if (!srcMatch) continue;
    const src = srcMatch[1].trim();

    const altMatch = /alt\s*=\s*["']([^"']*)["']/i.exec(attrsString);
    const alt = altMatch ? altMatch[1] : "";

    const loadingMatch = /loading\s*=\s*["']([^"']+)["']/i.exec(attrsString);
    const decodingMatch = /decoding\s*=\s*["']([^"']+)["']/i.exec(attrsString);
    const refPolicyMatch = /referrerpolicy\s*=\s*["']([^"']+)["']/i.exec(attrsString);
    const widthMatch = /width\s*=\s*["']?(\d+)[px%]?["']?/i.exec(attrsString);
    const heightMatch = /height\s*=\s*["']?(\d+)[px%]?["']?/i.exec(attrsString);
    const classMatch = /class\s*=\s*["']([^"']+)["']/i.exec(attrsString);

    const isDataUri = src.startsWith("data:");
    let domain = "data-uri";
    let isHttps = true;

    if (!isDataUri) {
      try {
        const parsed = new URL(src, "https://example.com");
        domain = parsed.hostname;
        isHttps = parsed.protocol === "https:";
      } catch {
        domain = "relative-or-invalid";
        isHttps = false;
      }
    }

    images.push({
      id: `img-${images.length + 1}`,
      src,
      alt,
      elementTag: "img",
      loadingAttr: loadingMatch ? loadingMatch[1] : undefined,
      decodingAttr: decodingMatch ? decodingMatch[1] : undefined,
      referrerPolicy: refPolicyMatch ? refPolicyMatch[1] : undefined,
      width: widthMatch ? widthMatch[1] : undefined,
      height: heightMatch ? heightMatch[1] : undefined,
      className: classMatch ? classMatch[1] : undefined,
      domain,
      isHttps,
      isDataUri,
      hasAlt: !!alt && alt.trim().length > 0,
      hasLazyLoading: loadingMatch ? loadingMatch[1].toLowerCase() === "lazy" : false,
      hasNoReferrer: refPolicyMatch ? refPolicyMatch[1].toLowerCase() === "no-referrer" : false,
      rawSnippet,
    });
    seenUrls.add(src);
  }

  // 2. Match CSS background-image: url(...)
  const bgRegex = /background(?:-image)?\s*:\s*[^;]*?url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const src = match[1].trim();
    if (seenUrls.has(src)) continue;

    const isDataUri = src.startsWith("data:");
    let domain = "data-uri";
    let isHttps = true;
    if (!isDataUri) {
      try {
        const parsed = new URL(src, "https://example.com");
        domain = parsed.hostname;
        isHttps = parsed.protocol === "https:";
      } catch {
        domain = "relative";
        isHttps = false;
      }
    }

    images.push({
      id: `img-${images.length + 1}`,
      src,
      alt: "(CSS Background Image)",
      elementTag: "css-bg",
      domain,
      isHttps,
      isDataUri,
      hasAlt: false,
      hasLazyLoading: false,
      hasNoReferrer: false,
      rawSnippet: match[0],
    });
    seenUrls.add(src);
  }

  // 3. Match Markdown ![](url)
  const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/gi;
  while ((match = mdRegex.exec(html)) !== null) {
    const alt = match[1];
    const src = match[2].trim();
    if (seenUrls.has(src)) continue;

    const isDataUri = src.startsWith("data:");
    let domain = "data-uri";
    let isHttps = true;
    if (!isDataUri) {
      try {
        const parsed = new URL(src, "https://example.com");
        domain = parsed.hostname;
        isHttps = parsed.protocol === "https:";
      } catch {
        domain = "relative";
        isHttps = false;
      }
    }

    images.push({
      id: `img-${images.length + 1}`,
      src,
      alt,
      elementTag: "markdown",
      domain,
      isHttps,
      isDataUri,
      hasAlt: !!alt,
      hasLazyLoading: false,
      hasNoReferrer: false,
      rawSnippet: match[0],
    });
    seenUrls.add(src);
  }

  return images;
}

export function optimizeHtmlHotlinks(html: string): { optimizedHtml: string; fixesCount: number } {
  let fixesCount = 0;

  let optimized = html.replace(/<img\s+([^>]*?)>/gi, (fullMatch, attrs) => {
    let updatedAttrs = attrs;

    // 1. Upgrade http to https if applicable
    if (/src\s*=\s*["']http:\/\//i.test(updatedAttrs)) {
      updatedAttrs = updatedAttrs.replace(/(src\s*=\s*["'])http:\/\//i, "$1https://");
      fixesCount++;
    }

    // 2. Ensure referrerpolicy="no-referrer" for reliable hotlinking
    if (!/referrerpolicy/i.test(updatedAttrs)) {
      updatedAttrs = `${updatedAttrs.trim()} referrerpolicy="no-referrer"`;
      fixesCount++;
    }

    // 3. Ensure loading="lazy"
    if (!/loading\s*=/i.test(updatedAttrs)) {
      updatedAttrs = `${updatedAttrs.trim()} loading="lazy"`;
      fixesCount++;
    }

    // 4. Ensure decoding="async"
    if (!/decoding\s*=/i.test(updatedAttrs)) {
      updatedAttrs = `${updatedAttrs.trim()} decoding="async"`;
      fixesCount++;
    }

    // 5. Ensure alt attribute is present
    if (!/alt\s*=/i.test(updatedAttrs)) {
      updatedAttrs = `${updatedAttrs.trim()} alt="Hotlinked visual asset"`;
      fixesCount++;
    }

    return `<img ${updatedAttrs.trim()}>`;
  });

  return { optimizedHtml: optimized, fixesCount };
}
