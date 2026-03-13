// Cloudinary unsigned upload utility
// Docs: https://cloudinary.com/documentation/upload_images#unsigned_upload
//
// Setup:
//   1. Create a free account at cloudinary.com
//   2. Dashboard → Settings → Upload → Add upload preset → Mode: Unsigned
//   3. Copy cloud name + preset name into .env.local

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export const isCloudinaryConfigured =
  Boolean(CLOUD_NAME) && CLOUD_NAME !== 'your-cloud-name';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}

/**
 * Upload a File to Cloudinary. Returns the secure URL and public_id.
 * Falls back gracefully if credentials are not configured.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'tft2-arena'
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured) {
    // In dev / no-creds mode, return a fake result pointing to a placeholder
    return {
      secure_url: URL.createObjectURL(file),
      public_id: `${folder}/${file.name}`,
      resource_type: file.type.startsWith('video') ? 'video' : 'image',
      format: file.name.split('.').pop() ?? 'jpg',
      bytes: file.size,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const resourceType = file.type.startsWith('video') ? 'video' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(endpoint, { method: 'POST', body: formData });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

/**
 * Build an optimised image URL from a Cloudinary public_id.
 * Applies auto-format, auto-quality, and optional width resize.
 */
export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number } = {}
): string {
  if (!isCloudinaryConfigured || !publicId) return publicId;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height},c_fill`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
