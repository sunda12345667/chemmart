import React, { useRef, useState } from 'react';
import { uploadFile } from '@/lib/storage';
import { Upload, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** @param {{ images?: string[], onChange: (images: string[]) => void }} props */
export default function ProductImageUploader({ images = [], onChange }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const safeFiles = Array.from(files).filter(file => {
      const valid = ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES;
      if (!valid) toast.error(`${file.name}: upload a JPEG, PNG, or WebP image smaller than 5 MB.`);
      return valid;
    });
    if (!safeFiles.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of safeFiles) { const { file_url } = await uploadFile({ file }); uploaded.push(file_url); }
      onChange([...images, ...uploaded]); toast.success('Image upload complete');
    } catch { toast.error('Unable to upload image. Please try again.'); }
    finally { setUploading(false); }
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
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
