import React from 'react';
import { Download, RefreshCw, Trash2, AlertCircle, Maximize, ExternalLink } from 'lucide-react';
import { CompressedImage, ImageFile } from '../types';
import { formatFileSize } from '../utils/imageCompression';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

interface ImagePreviewProps {
  originalImage: ImageFile;
  compressedImage?: CompressedImage;
  isCompressing: boolean;
  error: string | null;
  onCompress: () => void;
  onReset: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalImage,
  compressedImage,
  isCompressing,
  error,
  onCompress,
  onReset,
}) => {
  const handleDownload = () => {
    if (!compressedImage) return;
    
    const url = URL.createObjectURL(compressedImage.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressedImage.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openImageInNewTab = (imageUrl: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Image Viewer</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #1a1a1a;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Full size image" />
          </body>
        </html>
      `);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Image Preview</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex justify-between items-center">
              <span>Original</span>
              <button 
                onClick={() => openImageInNewTab(originalImage.preview)}
                className="text-bcl hover:text-bcl-hover flex items-center text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Full Size
              </button>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
              <img
                src={originalImage.preview}
                alt="Original"
                className="max-w-full max-h-full object-contain"
              />
              <button 
                onClick={() => openImageInNewTab(originalImage.preview)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Size: {formatFileSize(originalImage.size)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex justify-between items-center">
              <span>Compressed</span>
              {compressedImage && (
                <button 
                  onClick={() => openImageInNewTab(compressedImage.preview)}
                  className="text-bcl hover:text-bcl-hover flex items-center text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Size
                </button>
              )}
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
              {compressedImage ? (
                <>
                  <img
                    src={compressedImage.preview}
                    alt="Compressed"
                    className="max-w-full max-h-full object-contain"
                  />
                  <button 
                    onClick={() => openImageInNewTab(compressedImage.preview)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-500 p-4">
                  {isCompressing ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                      <span>Compressing...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <span>{error}</span>
                    </div>
                  ) : (
                    <span>Click "Compress" to see the result</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {compressedImage ? (
                <>
                  Size: {formatFileSize(compressedImage.size)}
                  <span className="ml-2 text-green-600">
                    ({compressedImage.compressionRatio.toFixed(1)}% reduction)
                  </span>
                </>
              ) : (
                'Size: -'
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 bg-gray-50 flex justify-between">
        <Button
          onClick={onReset}
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset
        </Button>

        <div className="space-x-3">
          {!compressedImage && !error && (
            <Button
              onClick={onCompress}
              disabled={isCompressing}
              variant="bcl"
            >
              {isCompressing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Compress
                </>
              )}
            </Button>
          )}

          {error && (
            <Button
              onClick={onCompress}
              variant="bcl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {compressedImage && (
            <>
              <Button
                onClick={onCompress}
                disabled={isCompressing}
                variant="bcl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recompress
              </Button>
              <Button
                onClick={handleDownload}
                variant="success"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ImagePreview;
