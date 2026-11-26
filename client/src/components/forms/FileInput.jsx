import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import ErrorMessage from './ErrorMessage';

/**
 * File Upload component with live image preview.
 * Demonstrates:
 * - Unit III: useState for preview, useEffect for object URL memory cleanup
 * - Unit IV: Uncontrolled components via useRef (direct DOM file input handling)
 */
export const FileInput = ({
  label = 'Upload Image Proof',
  accept = 'image/*',
  onChange,
  error,
  required = false,
  className,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Clean up object URL when component unmounts or preview changes (Unit III Effect Cleanup)
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setSelectedFile(file);
      if (onChange) onChange(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) onChange(null);
  };

  const handleClickContainer = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </span>
      )}

      {/* Hidden native input accessed via ref (Uncontrolled pattern) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={handleClickContainer}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group',
            error
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-400'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/60'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Click to upload or drag & drop
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Supports all file sizes (no size limits) • PNG, JPG, WEBP</p>
        </div>
      ) : (
        <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900/5 dark:bg-slate-900/30 group max-h-56 flex items-center justify-center">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-56 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClickContainer}
              className="px-3 py-1.5 text-xs bg-white text-slate-800 rounded-lg font-medium shadow-sm hover:bg-slate-100"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
          </div>
        </div>
      )}

      {error && <ErrorMessage error={error} />}
    </div>
  );
};

export default FileInput;
