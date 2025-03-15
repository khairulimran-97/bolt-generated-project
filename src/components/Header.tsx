import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img 
                src="https://ps.w.org/bcl-payment-link/assets/icon-128x128.png?rev=3163205" 
                alt="BCL Logo" 
                className="relative h-16 w-16 transform group-hover:scale-105 transition duration-200"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                BCL - Compress Image
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Browser-based Image Compression
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Processing locally</span>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="text-sm text-gray-600">
              100% Private & Secure
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
