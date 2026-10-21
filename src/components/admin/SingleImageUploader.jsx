import React, { useRef, useState } from 'react';
import { uploadFile } from '@/lib/storage';
import { Upload, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/** @param {{ label?: string, imageUrl?: string, onChange: (imageUrl: string) => void }} props */
export default function SingleImageUploader({ label = 'Image', imageUrl = '', onChange }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile({ file });
      onChange(file_url);
      toast.success('Image upload complete');
    } catch (error) {
      toast.error(error.message || 'Unable to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {imageUrl && (
        <div className="relative group inline-block">
          <img src={imageUrl} alt="" className="w-24 h-24 object-cover rounded-md border" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div
        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Upload className="h-4 w-4" />
            <span>{imageUrl ? 'Replace image' : 'Click or drag to upload'}</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}