'use client';

import { useState } from 'react';
import { adminUploadImage, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  height?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload image',
  className = '',
  height = 'h-40',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await adminUploadImage(file);
      onChange(res.url);
      toast('Image uploaded', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-bold mb-2">{label}</label>}
      <div
        className={`relative ${height} rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-fasty-light flex items-center justify-center`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </>
        ) : (
          <div className="text-center text-fasty-gray text-sm px-4">
            <p className="text-2xl mb-1">📷</p>
            <p>{uploading ? 'Uploading...' : 'Click to upload'}</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
