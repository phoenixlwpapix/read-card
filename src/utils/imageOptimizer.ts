/**
 * Utility to optimize user uploaded images for 3:4 reading cards.
 * Downscales oversized images (e.g. 12MP phone photos) to max 2048px,
 * preventing huge Base64 strings and ensuring fast rendering and storage.
 */
export function optimizeImageFile(file: File, maxDim = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVGs do not need downscaling
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to direct FileReader
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP or JPEG with high quality (0.92)
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = mime === 'image/jpeg' ? 0.92 : undefined;
      resolve(canvas.toDataURL(mime, quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
