import React from 'react';
import { CompressionOptions as CompressionOptionsType } from '../types';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface CompressionOptionsProps {
  options: CompressionOptionsType;
  onChange: (options: CompressionOptionsType) => void;
  onRecompress?: () => void;
}

const CompressionOptions: React.FC<CompressionOptionsProps> = ({
  options,
  onChange,
  onRecompress,
}) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...options,
      format: e.target.value as any,
    });
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      quality: parseInt(e.target.value, 10),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Compression Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Output Format
          </label>
          <select
            value={options.format}
            onChange={handleFormatChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bcl focus:border-bcl"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="avif">AVIF</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            AVIF and WebP generally provide the best compression
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quality: {options.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={handleQualityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {onRecompress && (
          <Button 
            onClick={onRecompress}
            variant="bcl"
            className="w-full mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recompress with New Settings
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CompressionOptions;
