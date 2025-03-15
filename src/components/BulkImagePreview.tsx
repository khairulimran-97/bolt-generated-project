import React from 'react';
import { Download, RefreshCw, Trash2, AlertCircle, CheckCircle, X, Package, ExternalLink } from 'lucide-react';
import { CompressedImage, ImageFile, CompressionOptions } from '../types';
import { formatFileSize } from '../utils/imageCompression';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

interface BulkImagePreviewProps {
  originalImages: ImageFile[];
  compressedImages: Record<string, CompressedImage>;
  isCompressing: boolean;
  compressionOptions: CompressionOptions;
  onCompress: () => void;
  onReset: () => void;
  onRemoveImage: (id: string) => void;
}

const BulkImagePreview: React.FC<BulkImagePreviewProps> = ({
  originalImages,
  compressedImages,
  isCompressing,
  compressionOptions,
  onCompress,
  onReset,
  onRemoveImage,
}) => {
  const handleDownloadAll = async () => {
    if (Object.keys(compressedImages).length === 0) return;
    
    const zip = new JSZip();
    
    // Add all compressed images to the zip
    Object.values(compressedImages).forEach(img => {
      if (img.file) {
        zip.file(img.file.name, img.file);
      }
    });
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Save the zip file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveAs(content, `compressed-images-${timestamp}.zip`);
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

  const allImagesCompressed = originalImages.length > 0 && 
    originalImages.every(img => compressedImages[img.id || ''] && 
    compressedImages[img.id || ''].status === 'completed');

  const totalOriginalSize = originalImages.reduce((sum, img) => sum + img.size, 0);
  const totalCompressedSize = Object.values(compressedImages)
    .filter(img => img.status === 'completed')
    .reduce((sum, img) => sum + img.size, 0);
  
  const totalCompressionRatio = totalOriginalSize > 0 
    ? (1 - (totalCompressedSize / totalOriginalSize)) * 100 
    : 0;

  const compressedCount = Object.values(compressedImages)
    .filter(img => img.status === 'completed').length;

  const errorCount = Object.values(compressedImages)
    .filter(img => img.status === 'error').length;

  return (
    <Card>
      <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">Bulk Image Compression</CardTitle>
        <div className="text-sm text-gray-600">
          {originalImages.length} image{originalImages.length !== 1 ? 's' : ''} selected
        </div>
      </CardHeader>

      {/* Summary Stats */}
      {originalImages.length > 0 && (
        <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Original Size</div>
            <div className="text-lg font-semibold">{formatFileSize(totalOriginalSize)}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Compressed Size</div>
            <div className="text-lg font-semibold">
              {compressedCount > 0 ? formatFileSize(totalCompressedSize) : '-'}
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Compression Ratio</div>
            <div className="text-lg font-semibold text-green-600">
              {compressedCount > 0 ? `${totalCompressionRatio.toFixed(1)}%` : '-'}
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-lg font-semibold flex items-center">
              {isCompressing ? (
                <><RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Compressing</>
              ) : allImagesCompressed ? (
                <><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Completed</>
              ) : errorCount > 0 ? (
                <><AlertCircle className="h-4 w-4 mr-1 text-red-500" /> {errorCount} error{errorCount !== 1 ? 's' : ''}</>
              ) : (
                'Ready'
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image List */}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {originalImages.map((image) => {
            const compressed = compressedImages[image.id || ''];
            const isCompressed = compressed && compressed.status === 'completed';
            const hasError = compressed && compressed.status === 'error';
            const isProcessing = compressed && compressed.status === 'compressing';

            return (
              <div key={image.id} className="p-4 border-b flex items-center">
                <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative group">
                  <img
                    src={image.preview}
                    alt={image.name || 'Image'}
                    className="h-full w-full object-cover"
                  />
                  <button 
                    onClick={() => openImageInNewTab(image.preview)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="text-sm font-medium text-gray-800 truncate max-w-xs">
                    {image.name || 'Image'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Original: {formatFileSize(image.size)}
                    {isCompressed && (
                      <>
                        <span className="mx-1">→</span>
                        <span className="text-green-600">
                          {formatFileSize(compressed.size)} ({compressed.compressionRatio.toFixed(1)}% reduction)
                        </span>
                      </>
                    )}
                  </div>
                  {hasError && (
                    <div className="text-xs text-red-500 mt-1">
                      {compressed.error || 'Error compressing image'}
                    </div>
                  )}
                </div>
                
                <div className="ml-auto flex items-center">
                  {isProcessing && (
                    <RefreshCw className="h-4 w-4 text-bcl animate-spin" />
                  )}
                  {isCompressed && (
                    <div className="flex items-center">
                      <button
                        onClick={() => openImageInNewTab(compressed.preview)}
                        className="mr-2 text-bcl hover:text-bcl-hover"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {hasError && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <button 
                    onClick={() => onRemoveImage(image.id || '')}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {originalImages.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No images selected. Upload some images to get started.
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 bg-gray-50 flex justify-between">
        <Button
          onClick={onReset}
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset All
        </Button>

        <div className="space-x-3">
          <Button
            onClick={onCompress}
            disabled={isCompressing || originalImages.length === 0}
            variant="bcl"
          >
            {isCompressing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Compressing...
              </>
            ) : allImagesCompressed ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recompress All
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Compress All
              </>
            )}
          </Button>

          {Object.keys(compressedImages).length > 0 && compressedCount > 0 && (
            <Button
              onClick={handleDownloadAll}
              variant="success"
            >
              <Package className="h-4 w-4 mr-2" />
              Download ZIP
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BulkImagePreview;
