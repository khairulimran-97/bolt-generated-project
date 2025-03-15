import React from 'react';
import { Shield, Lock, Server } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-100">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy First</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-bcl" />
                <span>End-to-end encryption</span>
              </li>
              <li className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-bcl" />
                <span>Local processing only</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-bcl" />
                <span>No data collection</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Bulk image compression</li>
              <li>Multiple format support</li>
              <li>Real-time preview</li>
              <li>Custom quality settings</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">About</h3>
            <p className="text-sm text-gray-600">
              BCL Image Compressor is a powerful tool designed for efficient image compression without compromising quality.
            </p>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              © 2025 Bayarcash Sdn. Bhd. 202201040365 (1486062-H)
            </p>
            <p className="mt-1 text-sm text-gray-500">
              All images are processed locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
