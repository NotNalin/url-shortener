interface DownloadOptions {
  padding?: number; // space around QR (in CSS‑pixels)
  fontSize?: number; // text size below QR (in CSS‑pixels)
  fontFamily?: string; // fallback font family
}

/**
 * Renders the QR SVG into a PNG, stamps the short URL below it,
 * then triggers a download.
 */
export async function downloadQRCode(
  slug: string | null,
  options: DownloadOptions = {},
): Promise<void> {
  // ---- 1. Validate input & grab SVG ----
  if (!slug) {
    throw new Error("Cannot download: slug is null or empty.");
  }
  const container = document.getElementById(`qr-code-${slug}`);
  const svgEl = container?.querySelector("svg") as SVGSVGElement | null;
  if (!svgEl) {
    throw new Error(`SVG element not found for "#qr-code-${slug}".`);
  }

  // ---- 2. Serialize SVG → Blob → Image ----
  const svgString = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgURL = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG into Image."));
    img.src = svgURL;
  });
  URL.revokeObjectURL(svgURL);

  // ---- 3. Compute sizes (with DPI scaling) ----
  const dpr = window.devicePixelRatio || 1;
  const padding = options.padding ?? 20;
  const fontSize = options.fontSize ?? 14;
  const fontFamily = options.fontFamily ?? "Arial, sans‑serif";
  const shortUrl = `${window.location.origin}/${slug}`;

  // measure text width (at 1× scale)
  const measureCanvas = document.createElement("canvas").getContext("2d")!;
  measureCanvas.font = `${fontSize}px ${fontFamily}`;
  const textWidth = measureCanvas.measureText(shortUrl).width;

  // final canvas dimensions (in device pixels)
  const canvasWidth = Math.max(img.width, textWidth + padding * 2) * dpr;
  const canvasHeight = (img.height + fontSize + padding * 2) * dpr;

  // ---- 4. Draw to canvas ----
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context.");

  // scale for DPI
  ctx.scale(dpr, dpr);

  // white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth / dpr, canvasHeight / dpr);

  // QR code image
  const imgX = (canvasWidth / dpr - img.width) / 2;
  ctx.drawImage(img, imgX, padding, img.width, img.height);

  // short URL text
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(shortUrl, canvasWidth / (2 * dpr), img.height + padding + 4);

  // ---- 5. Convert to Blob & download ----
  const blob: Blob = await new Promise(
    (res) => canvas.toBlob((b) => res(b!), "image/png"), // guaranteed to be non-null here
  );
  const blobURL = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobURL;
  link.download = `qr-code-${slug}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobURL);
}
