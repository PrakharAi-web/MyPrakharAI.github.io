
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-gray-50 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-[#FF6B00] border-r-[#FFB800] animate-spin rounded-full"></div>
      </div>
      <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">
        Prakhar AI is <span className="gemini-gradient-text">Creating</span>
      </h2>
      <p className="mt-2 text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Processing masterpiece...</p>
    </div>
  );
};

export default LoadingOverlay;
