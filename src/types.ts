export interface ImageFile {
  file: File;
  preview: string;
  size: number;
  id?: string;
  name?: string;
}

export interface CompressedImage extends ImageFile {
  originalSize: number;
  compressionRatio: number;
  status?: 'pending' | 'compressing' | 'completed' | 'error';
  error?: string;
}

export type CompressionFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface CompressionOptions {
  format: CompressionFormat;
  quality: number;
}
