// Lightweight client-side image compression utilities
// Note: Uses Canvas API, works for JPEG/PNG/WebP inputs

export interface CompressOptions {
  maxWidth?: number; // Max width in pixels
  maxHeight?: number; // Max height in pixels
  quality?: number; // 0-1 for JPEG/WebP
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  maxBytes?: number; // Optional hard cap; will reduce quality iteratively
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const drawToCanvas = (img: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  let { width, height } = img;

  // Maintain aspect ratio while fitting into bounds
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

export const compressImage = async (file: File, options: CompressOptions = {}): Promise<File> => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    mimeType = 'image/jpeg',
    maxBytes,
  } = options;

  // Skip compression for tiny files
  if (!maxBytes && file.size < 300 * 1024) return file;

  const img = await loadImage(file);
  const canvas = drawToCanvas(img, maxWidth, maxHeight);

  // Helper to produce a Blob at a given quality
  const toBlob = (q: number): Promise<Blob> => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to create blob'));
      resolve(blob);
    }, mimeType, q);
  });

  // If no maxBytes target, single pass
  if (!maxBytes) {
    const blob = await toBlob(quality);
    return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: mimeType });
  }

  // Iteratively reduce quality until under maxBytes or hit floor
  let q = quality;
  let blob = await toBlob(q);
  let attempts = 0;
  while (blob.size > maxBytes && q > 0.4 && attempts < 6) {
    q -= 0.1;
    blob = await toBlob(q);
    attempts++;
  }

  return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: mimeType });
};
