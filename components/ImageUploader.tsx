"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
  multiple?: boolean;
}

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function ImageUploader({ onImageUploaded, multiple = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setError(null);

    // Фильтруем только изображения
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Выберите изображения');
      return;
    }

    // Если не multiple, берем только первый файл
    const filesToUpload = multiple ? imageFiles : [imageFiles[0]];

    for (const file of filesToUpload) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      
      const uploadedImage: UploadedImage = {
        url: data.url,
        filename: data.filename,
        size: data.size,
        type: data.type
      };

      setUploadedImages(prev => [...prev, uploadedImage]);
      
      if (onImageUploaded) {
        onImageUploaded(data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging 
            ? "border-purple-500 bg-purple-500/10" 
            : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
              <p className="text-white font-medium">Загрузка...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-white font-medium mb-1">
                Перетащите изображения сюда
              </p>
              <p className="text-sm text-gray-500 mb-3">или</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                Выберите файлы
              </button>
              <p className="text-xs text-gray-600 mt-3">
                PNG, JPG, GIF, WebP до 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Загруженные изображения:</h4>
          <div className="grid gap-2">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                  <img 
                    src={image.url} 
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{image.filename}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </span>
                    <span className="text-xs text-gray-700">•</span>
                    <button
                      onClick={() => copyUrl(image.url)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {copiedUrl === image.url ? (
                        <>
                          <Check className="w-3 h-3" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Копировать URL
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Открыть в новой вкладке"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Markdown Helper */}
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-400 mb-2">
              Для вставки в статью используйте:
            </p>
            <code className="text-xs text-white bg-black/50 px-2 py-1 rounded">
              ![Описание]({uploadedImages[uploadedImages.length - 1].url})
            </code>
          </div>
        </div>
      )}
    </div>
  );
}