import React, { useCallback, useState } from 'react';
import { Upload, X, FileWarning, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';
import { createImagePreview } from '../utils/imageCompression';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onImagesSelect: (images: ImageFile[]) => void;
  maxFiles?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImagesSelect, maxFiles = 20 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const validateFiles = (files: File[]): File[] => {
    setError(null);
    
    // Check if any file is not an image
    const nonImageFiles = files.filter(file => !file.type.match('image.*'));
    if (nonImageFiles.length > 0) {
      setError(`${nonImageFiles.length} file(s) are not images and will be skipped. Please select only image files.`);
    }

    // Filter out non-image files
    let imageFiles = files.filter(file => file.type.match('image.*'));

    // Check file size (max 50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed the 50MB size limit and will be skipped. Please compress these files first or select smaller files.`);
      imageFiles = imageFiles.filter(file => file.size <= maxSize);
    }

    // Check number of files
    if (imageFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} files will be processed. Please select fewer files.`);
      imageFiles = imageFiles.slice(0, maxFiles);
    }

    return imageFiles;
  };

  const processFiles = async (files: File[]) => {
    const validFiles = validateFiles(files);
    
    if (validFiles.length === 0) {
      setError('No valid image files to process. Please ensure your files are images and within the size limit (50MB per file).');
      return;
    }

    try {
      const processedImages: ImageFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const preview = await createImagePreview(file);
          return {
            file,
            preview,
            size: file.size,
            id: uuidv4(),
            name: file.name
          };
        })
      );

      onImagesSelect(processedImages);
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Error processing files. Please try again with different files or refresh the page.');
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files);
        await processFiles(filesArray);
      }
    },
    [onImagesSelect, maxFiles]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      await processFiles(filesArray);
      // Reset the input value so the same files can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
          isDragging
            ? "border-bcl bg-blue-50 scale-102 shadow-lg"
            : "border-gray-300 hover:border-bcl hover:bg-gray-50"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          multiple
        />
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 blur-3xl opacity-20"></div>
          <div className="relative flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-100 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Upload className="h-16 w-16 text-bcl relative" />
            </div>
            
            <div className="space-y-2">
              <div className="text-xl font-medium text-gray-700">
                Drag & drop your images here
              </div>
              <div className="text-sm text-gray-500">
                or click to browse
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
              <div className="flex items-center space-x-1 text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-600">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>JPEG</span>
              </div>
              <div className="flex items-center space-x-1 text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-600">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>PNG</span>
              </div>
              <div className="flex items-center space-x-1 text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-600">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>WebP</span>
              </div>
              <div className="flex items-center space-x-1 text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-600">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>AVIF</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Max file size: 50MB | Up to {maxFiles} images at once
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
          <FileWarning className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
