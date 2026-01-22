'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

/**
 * ImageUploader Component
 * 
 * A cyberpunk/neo-brutalism styled image uploader with drag-and-drop support.
 * Features neon glows, scanline effects, and holographic shimmer animations.
 * 
 * @component
 */

interface ImageUploaderProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'preview' | 'error';

export default function ImageUploader({
  currentImage,
  onUpload,
  onRemove,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
}: ImageUploaderProps) {
  const [state, setState] = useState<UploadState>(currentImage ? 'preview' : 'idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]?.toUpperCase() ?? 'UNKNOWN').join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    // Set file info
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type.split('/')[1]?.toUpperCase() ?? 'FILE',
    });

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setState('uploading');

    // Simulate upload progress (replace with actual upload logic)
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'post');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Small delay to show 100% before transitioning
      setTimeout(() => {
        setPreviewUrl(data.url);
        onUpload(data.url);
        setState('preview');
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setState('error');
      setPreviewUrl(null);
      setUploadProgress(0);
      setTimeout(() => setState('idle'), 3000);
    }
  }, [acceptedTypes, maxSizeMB, onUpload]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setState('dragging');
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setState(previewUrl ? 'preview' : 'idle');
    }
  }, [previewUrl]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    const firstFile = files?.[0];
    if (firstFile) {
      handleFile(firstFile);
    }
  }, [disabled, handleFile]);

  // Click to open file picker
  const handleClick = () => {
    if (!disabled && state !== 'uploading') {
      fileInputRef.current?.click();
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const firstFile = files?.[0];
    if (firstFile) {
      handleFile(firstFile);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileInfo(null);
    setState('idle');
    onRemove();
  };

  // Get container classes based on state
  const getContainerClasses = (): string => {
    const baseClasses = `
      relative w-full min-h-[200px] rounded-xl
      transition-all duration-300 ease-out
      overflow-hidden
    `;

    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-[#1A1F3A]/30 border-2 border-dashed border-gray-600`;
    }

    switch (state) {
      case 'dragging':
        return `${baseClasses} 
          bg-[#00E0FF]/5 
          border-4 border-solid border-[#00E0FF] 
          shadow-[0_0_40px_rgba(0,224,255,0.4),inset_0_0_40px_rgba(0,224,255,0.1)]
          cursor-copy scale-[1.02]`;
      
      case 'uploading':
        return `${baseClasses} 
          bg-[#0D0F1C]/80 
          border-4 border-[#9D4EDD] 
          shadow-[0_0_30px_rgba(157,78,221,0.5)]
          animate-pulse`;
      
      case 'preview':
        return `${baseClasses} 
          bg-[#1A1F3A]/40 
          border-3 border-[#9D4EDD] 
          shadow-[0_0_20px_rgba(157,78,221,0.3)]
          hover:shadow-[0_0_30px_rgba(157,78,221,0.5)]
          cursor-pointer`;
      
      case 'error':
        return `${baseClasses} 
          bg-red-500/10 
          border-4 border-dashed border-red-500 
          shadow-[0_0_30px_rgba(239,68,68,0.4)]
          animate-[glitch_0.3s_ease-in-out_infinite]`;
      
      default: // idle
        return `${baseClasses} 
          bg-[#0D0F1C]/50 
          border-4 border-dashed border-[#9D4EDD]/50 
          backdrop-blur-sm
          hover:border-[#9D4EDD] 
          hover:shadow-[0_0_30px_rgba(157,78,221,0.4)]
          hover:bg-[#0D0F1C]/70
          cursor-pointer
          ${isHovering ? 'scale-[1.01]' : ''}`;
    }
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload image"
      />

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={state === 'preview' ? 'Change image' : 'Upload image'}
        aria-disabled={disabled}
        className={getContainerClasses()}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(157,78,221,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(157,78,221,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Content based on state */}
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
            <div className={`
              w-16 h-16 mb-4 rounded-xl
              bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/50
              flex items-center justify-center
              transition-all duration-300
              ${isHovering ? 'scale-110 shadow-[0_0_20px_rgba(157,78,221,0.5)]' : ''}
            `}>
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-[#9D4EDD]"></i>
            </div>
            <p className="text-white font-bold mb-1">
              Drag & drop or click to upload
            </p>
            <p className="text-gray-400 text-sm">
              {acceptedTypes.map(t => t.split('/')[1]?.toUpperCase() ?? 'FILE').join(', ')} • Max {maxSizeMB}MB
            </p>
          </div>
        )}

        {state === 'dragging' && (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
            <div className="w-20 h-20 mb-4 rounded-xl bg-[#00E0FF]/20 border-2 border-[#00E0FF] flex items-center justify-center animate-bounce">
              <i className="fa-solid fa-download text-3xl text-[#00E0FF]"></i>
            </div>
            <p className="text-[#00E0FF] font-bold text-lg">
              Drop to upload!
            </p>
          </div>
        )}

        {state === 'uploading' && (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center relative">
            {/* Scanline effect */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(157,78,221,0.03) 2px, rgba(157,78,221,0.03) 4px)',
                animation: 'scanlines 8s linear infinite',
              }}
            />
            
            {/* Preview thumbnail during upload */}
            {previewUrl && (
              <div className="w-24 h-24 mb-4 rounded-lg overflow-hidden border-2 border-[#9D4EDD]/50 opacity-50">
                <Image
                  src={previewUrl}
                  alt="Uploading preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full max-w-xs mb-3">
              <div className="h-3 bg-[#1A1F3A] rounded-full overflow-hidden border border-[#9D4EDD]/30">
                <div 
                  className="h-full bg-gradient-to-r from-[#9D4EDD] to-[#00E0FF] transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            
            <p className="text-white font-mono text-lg">
              {uploadProgress}%
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Uploading...
            </p>
          </div>
        )}

        {state === 'preview' && previewUrl && (
          <div className="relative min-h-[200px] p-4">
            {/* Image preview */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[#9D4EDD]/30 shadow-[4px_4px_0_0_rgba(157,78,221,0.3)]">
              <Image
                src={previewUrl}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
              
              {/* Hover overlay */}
              <div className={`
                absolute inset-0 bg-[#0D0F1C]/70 flex items-center justify-center
                transition-opacity duration-300
                ${isHovering ? 'opacity-100' : 'opacity-0'}
              `}>
                <span className="text-white font-bold flex items-center gap-2">
                  <i className="fa-solid fa-pen"></i>
                  Change Image
                </span>
              </div>
            </div>

            {/* File info */}
            {fileInfo && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="px-2 py-1 rounded bg-[#9D4EDD]/20 text-[#9D4EDD] font-mono text-xs">
                    {fileInfo.type}
                  </span>
                  <span>{fileInfo.size}</span>
                </div>
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute top-6 right-6 w-8 h-8 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-200 z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <i className="fa-solid fa-exclamation-triangle text-2xl text-red-500"></i>
            </div>
            <p className="text-red-400 font-bold mb-1">
              Upload Failed
            </p>
            <p className="text-red-400/70 text-sm max-w-xs">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
      `}</style>
    </div>
  );
}
