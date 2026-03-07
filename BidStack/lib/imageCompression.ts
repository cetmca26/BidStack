/**
 * Image Compression Utility
 * Compresses images to max 800px width with 0.8 quality using Canvas API
 */

interface CompressionOptions {
  maxWidth?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const { maxWidth = 800, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not compress image"));
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Could not load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate a preview URL from a compressed blob
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
