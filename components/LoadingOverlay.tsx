
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="relative w-40 h-40 mb-12">
        <div className="absolute inset-0 border-[12px] border-gray-50 rounded-full shadow-inner"></div>
        <div className="absolute inset-0 border-[12px] border-transparent border-t-[#FF6B00] border-r-[#FFB800] border-b-[#FF6B00] animate-spin rounded-full filter blur-[0.5px]"></div>
        <div className="absolute inset-4 gemini-loader-bar rounded-full opacity-10 animate-pulse"></div>
      </div>
      
      <div className="space-y-6 max-w-xl">
        <h2 className="text-5xl font-black text-[#1f1f1f] tracking-tighter leading-tight">
          Prakhar is <span className="gemini-gradient-text italic">Manifesting</span>
        </h2>
        <p className="text-[17px] text-[#444746] font-medium leading-relaxed max-w-md mx-auto opacity-70">
          We're fine-tuning the pixels for your masterpiece. This artistic journey takes just a moment.
        </p>
      </div>
      
      <div className="mt-16 flex items-center space-x-3">
        <div className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2.5 h-2.5 bg-[#FFB800] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;