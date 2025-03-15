import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dropzone from './components/Dropzone';
import CompressionOptions from './components/CompressionOptions';
import ImagePreview from './components/ImagePreview';
import BulkImagePreview from './components/BulkImagePreview';
import { ImageFile, CompressedImage, CompressionOptions as CompressionOptionsType } from './types';
import { compressImage, createImagePreview, calculateCompressionRatio } from './utils/imageCompression';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

function App() {
  const [originalImages, setOriginalImages] = useState<ImageFile[]>([]);
  const [compressedImages, setCompressedImages] = useState<Record<string, CompressedImage>>({});
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptionsType>({
    format: 'webp',
    quality: 80,
  });
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Reset bulk mode when no images are selected
  React.useEffect(() => {
    if (originalImages.length === 0) {
      setIsBulkMode(false);
    } else if (originalImages.length > 1) {
      setIsBulkMode(true);
    }
  }, [originalImages.length]);

  const handleImageSelect = useCallback((image: ImageFile) => {
    setOriginalImages([image]);
    setCompressedImages({});
    setError(null);
    setIsBulkMode(false);
  }, []);

  const handleImagesSelect = useCallback((images: ImageFile[]) => {
    setOriginalImages(images);
    setCompressedImages({});
    setError(null);
    setIsBulkMode(images.length > 1);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setOriginalImages(prev => prev.filter(img => img.id !== id));
    setCompressedImages(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  const compressSingleImage = async (image: ImageFile) => {
    if (!image) return;

    setIsCompressing(true);
    setCompressedImages({});
    setError(null);

    try {
      const compressedFile = await compressImage(image.file, compressionOptions);
      const preview = await createImagePreview(compressedFile);
      const compressionRatio = calculateCompressionRatio(image.size, compressedFile.size);

      setCompressedImages({
        [image.id || '']: {
          file: compressedFile,
          preview,
          size: compressedFile.size,
          originalSize: image.size,
          compressionRatio,
          status: 'completed',
          id: image.id,
          name: image.name
        }
      });
    } catch (error) {
      console.error('Compression error:', error);
      setError(error instanceof Error ? error.message : 'Failed to compress image. Please try another image or format.');
    } finally {
      setIsCompressing(false);
    }
  };

  const compressMultipleImages = async () => {
    if (originalImages.length === 0) return;

    setIsCompressing(true);
    setError(null);

    // Initialize all images as pending
    const initialState: Record<string, CompressedImage> = {};
    originalImages.forEach(img => {
      initialState[img.id || ''] = {
        ...img,
        originalSize: img.size,
        compressionRatio: 0,
        status: 'pending'
      };
    });
    setCompressedImages(initialState);

    // Process images sequentially to avoid overwhelming the browser
    for (const image of originalImages) {
      if (!image.id) continue;

      // Update status to compressing
      setCompressedImages(prev => ({
        ...prev,
        [image.id || '']: {
          ...prev[image.id || ''],
          status: 'compressing'
        }
      }));

      try {
        const compressedFile = await compressImage(image.file, compressionOptions);
        const preview = await createImagePreview(compressedFile);
        const compressionRatio = calculateCompressionRatio(image.size, compressedFile.size);

        // Update with compressed result
        setCompressedImages(prev => ({
          ...prev,
          [image.id || '']: {
            file: compressedFile,
            preview,
            size: compressedFile.size,
            originalSize: image.size,
            compressionRatio,
            status: 'completed',
            id: image.id,
            name: image.name
          }
         }));
      } catch (error) {
        console.error(`Compression error for ${image.name}:`, error);
        
        // Update with error status
        setCompressedImages(prev => ({
          ...prev,
          [image.id || '']: {
            ...prev[image.id || ''],
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to compress image'
          }
        }));
      }
    }

    setIsCompressing(false);
  };

  const handleCompress = async () => {
    if (isBulkMode) {
      await compressMultipleImages();
    } else if (originalImages.length === 1) {
      await compressSingleImage(originalImages[0]);
    }
  };

  const handleReset = () => {
    setOriginalImages([]);
    setCompressedImages({});
    setError(null);
    setIsBulkMode(false);
  };

  const toggleBulkMode = () => {
    if (originalImages.length > 0) {
      setIsBulkMode(!isBulkMode);
    }
  };

  const handleOptionsChange = (newOptions: CompressionOptionsType) => {
    setCompressionOptions(newOptions);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Compress Your Images
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fast, free, and secure browser-based image compression. No upload needed - everything happens right in your browser.
            </p>
            {originalImages.length > 0 && (
              <div className="mt-6">
                <button 
                  onClick={toggleBulkMode}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-bcl hover:text-bcl-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bcl transition-colors duration-200"
                >
                  {isBulkMode ? "Switch to Single Mode" : "Switch to Bulk Mode"}
                </button>
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto">
            {originalImages.length === 0 ? (
              <div className="max-w-xl mx-auto">
                <Dropzone onImagesSelect={handleImagesSelect} maxFiles={20} />
              </div>
            ) : isBulkMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <BulkImagePreview
                    originalImages={originalImages}
                    compressedImages={compressedImages}
                    isCompressing={isCompressing}
                    compressionOptions={compressionOptions}
                    onCompress={handleCompress}
                    onReset={handleReset}
                    onRemoveImage={handleRemoveImage}
                  />
                </div>
                <div className="lg:col-span-1">
                  <CompressionOptions
                    options={compressionOptions}
                    onChange={handleOptionsChange}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <ImagePreview
                    originalImage={originalImages[0]}
                    compressedImage={compressedImages[originalImages[0]?.id || ''] || undefined}
                    isCompressing={isCompressing}
                    error={error}
                    onCompress={handleCompress}
                    onReset={handleReset}
                  />
                </div>
                <div className="lg:col-span-1">
                  <CompressionOptions
                    options={compressionOptions}
                    onChange={handleOptionsChange}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-16">
            <Card className="bg-white/50 backdrop-blur-sm border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Features</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-1">✓</span>
                        <span>Bulk Compression: Process up to 20 images at once</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-1">✓</span>
                        <span>Format Conversion: Convert between JPEG, PNG, and WebP</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-1">✓</span>
                        <span>Quality Control: Fine-tune compression settings</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-1">✓</span>
                        <span>Side-by-side Comparison: Preview before downloading</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Privacy & Security</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-1">🔒</span>
                        <span>100% Browser-based: No server uploads needed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-1">🔒</span>
                        <span>Your images never leave your device</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-1">🔒</span>
                        <span>Secure and private image processing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-1">🔒</span>
                        <span>No data collection or tracking</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
