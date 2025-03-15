import Compressor from 'compressorjs';
import UPNG from 'upng-js';
import imageCompression from 'browser-image-compression';
import { CompressionOptions } from '../types';

// Convert File to ArrayBuffer
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Convert ArrayBuffer to Blob
const arrayBufferToBlob = (buffer: ArrayBuffer, type: string): Blob => {
  return new Blob([buffer], { type });
};

// Convert image to AVIF format
const convertToAVIF = async (file: File, quality: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Check if browser supports AVIF encoding
      if (canvas.toBlob && canvas.toBlob.toString().includes('avif')) {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create AVIF blob'));
              return;
            }
            
            const avifFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.avif'), {
              type: 'image/avif',
              lastModified: Date.now(),
            });
            
            resolve(avifFile);
          },
          'image/avif',
          quality / 100
        );
      } else {
        // Fallback to WebP if AVIF is not supported
        console.warn('AVIF not supported by browser, falling back to WebP');
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create WebP blob'));
              return;
            }
            
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            resolve(webpFile);
          },
          'image/webp',
          quality / 100
        );
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Convert image to WebP format
const convertToWebP = async (file: File, quality: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create WebP blob'));
            return;
          }
          
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          resolve(webpFile);
        },
        'image/webp',
        quality / 100
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Compress JPEG using CompressorJS
const compressJPEG = async (file: File, options: CompressionOptions): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: options.quality / 100,
      mimeType: getMimeType(options.format),
      success(result) {
        const compressedFile = new File([result], 
          file.name.replace(/\.[^/.]+$/, `.${options.format}`), {
          type: getMimeType(options.format),
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      },
      error(err) {
        console.error('JPEG compression error:', err);
        reject(new Error(`JPEG compression failed: ${err.message || 'Unknown error'}`));
      },
    });
  });
};

// Get MIME type for format
const getMimeType = (format: string): string => {
  const mimeTypes = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif'
  };
  return mimeTypes[format as keyof typeof mimeTypes] || 'image/jpeg';
};

// Load image as ImageData for PNG compression
const loadImageData = async (file: File): Promise<{ imgData: ImageData; width: number; height: number }> => {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  return {
    imgData,
    width: canvas.width,
    height: canvas.height
  };
};

// Compress PNG using UPNG.js for PNG output, canvas for other formats
const compressPNG = async (file: File, options: CompressionOptions): Promise<File> => {
  try {
    if (options.format === 'png') {
      const { imgData, width, height } = await loadImageData(file);
      const cnum = Math.floor((100 - options.quality) / 11);
      const pngData = UPNG.encode([imgData.data.buffer], width, height, cnum);
      
      const compressedFile = new File([pngData], file.name.replace(/\.[^/.]+$/, '.png'), {
        type: 'image/png',
        lastModified: Date.now(),
      });

      if (compressedFile.size >= file.size) {
        console.warn('PNG compression ineffective, using original');
        return file;
      }

      return compressedFile;
    }

    const img = new Image();
    const loadImagePromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load PNG image'));
      img.src = URL.createObjectURL(file);
    });

    await loadImagePromise;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);

    const mimeType = getMimeType(options.format);
    const quality = options.quality / 100;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Could not create ${options.format} blob`));
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${options.format}`), {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    });
  } catch (error) {
    console.error('PNG compression error:', error);
    throw new Error(`PNG compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Main compression function with improved error handling
export const compressImage = async (file: File, options: CompressionOptions): Promise<File> => {
  try {
    if (!file || file.size === 0) {
      throw new Error('Invalid file: empty or missing');
    }
    
    const fileType = file.type.split('/')[1]?.toLowerCase();
    
    // For very large images, use initial size reduction
    if (file.size > 10 * 1024 * 1024) {
      try {
        const resizeOptions = {
          maxSizeMB: 10,
          maxWidthOrHeight: 4000,
          useWebWorker: true,
          fileType: fileType,
        };
        
        file = await imageCompression(file, resizeOptions);
      } catch (resizeError) {
        console.warn('Pre-compression resize failed:', resizeError);
      }
    }
    
    // Handle AVIF conversion
    if (options.format === 'avif') {
      return await convertToAVIF(file, options.quality);
    }
    
    // Process based on image type
    if (fileType === 'jpeg' || fileType === 'jpg') {
      return await compressJPEG(file, options);
    } else if (fileType === 'png') {
      return await compressPNG(file, options);
    } else if (fileType === 'webp' || fileType === 'avif') {
      return await compressJPEG(file, options);
    } else {
      console.warn(`Unsupported image format: ${fileType}, attempting to convert to ${options.format}`);
      return await compressJPEG(file, options);
    }
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create a preview URL for an image file
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      reject(new Error('Invalid file: empty or missing'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => {
      console.error('Preview creation error:', error);
      reject(new Error('Failed to create image preview'));
    };
    reader.readAsDataURL(file);
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate compression ratio
export const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
  if (originalSize === 0) return 0;
  return (1 - (compressedSize / originalSize)) * 100;
};
