import React, { useRef, useState } from 'react';
import { removeUploadedFiles, uploadFile } from '@/lib/storage';
import { Upload, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** @param {{ images?: string[], onChange: (images: string[]) => void, onUploadingChange?: (uploading: boolean) => void, onPendingUploadsChange?: (uploads: { path: string, url: string }[]) => void }} props */
export default function ProductImageUploader({ images = [], onChange, onUploadingChange, onPendingUploadsChange }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const uploadingRef = useRef(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length || uploadingRef.current) return;
    const safeFiles = Array.from(files).filter(file => {
      const valid = ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES;
      if (!valid) toast.error(`${file.name}: upload a JPEG, PNG, or WebP image smaller than 5 MB.`);
      return valid;
    });
    if (!safeFiles.length) return;
    uploadingRef.current = true;
    setUploading(true);
    onUploadingChange?.(true);
    const uploaded = [];
    try {
      for (const file of safeFiles) {
        const { file_url, storage_path } = await uploadFile({ file });
        uploaded.push({ path: storage_path, url: file_url });
      }
      onChange([...images, ...uploaded.map(file => file.url)]);
      onPendingUploadsChange?.(uploaded);
      toast.success('Image upload complete');
    } catch (error) {
      // If a multi-file batch fails partway through, remove objects uploaded by
      // that batch so the remaining files are not orphaned in storage.
      let cleanupFailed = false;
      try {
        await removeUploadedFiles(uploaded.map(file => file.path));
      } catch (cleanupError) {
        cleanupFailed = true;
        console.error('Partial image upload cleanup failed.', cleanupError);
      }
      toast.error(cleanupFailed
        ? 'Upload failed and temporary image cleanup also failed. Retry the upload or contact support.'
        : error.message || 'Unable to upload image. Please try again.');
    }
    finally { uploadingRef.current = false; setUploading(false); onUploadingChange?.(false); }
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };
  const moveImage = (idx, direction) => {
    const next = [...images]; const target = idx + direction;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]]; onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label>Product Images</Label>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-md border" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 hidden gap-1 bg-black/55 p-1 text-center group-hover:flex">
                <button type="button" className="flex-1 text-xs text-white" onClick={() => moveImage(idx, -1)}>‹</button>
                <button type="button" className="flex-1 text-xs text-white" onClick={() => moveImage(idx, 1)}>›</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Upload className="h-4 w-4" />
            <span>Click or drag images to upload</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ''; }}
      />
    </div>
  );
}
