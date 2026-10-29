import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'product-images';
const IMAGE_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadFile({ file }) {
  const ext = IMAGE_EXTENSIONS[file.type];
  if (!ext || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Upload a JPEG, PNG, or WebP image smaller than 5 MB.');
  }
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { file_url: data.publicUrl, storage_path: path };
}

export async function removeUploadedFiles(paths) {
  if (!paths?.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}
