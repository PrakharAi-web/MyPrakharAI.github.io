import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="relative w-48 h-48 mb-12">
        <div className="absolute inset-0 border-[16px] border-gray-50 rounded-full"></div>
        <div className="absolute inset-0 border-[16px] border-transparent border-t-red-500 border-r-blue-500 animate-spin rounded-full"></div>
        <div className="absolute inset-4 border-[1px] border-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="prakhar-gradient-text text-4xl font-black italic">P</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic">
          Neural <span className="prakhar-gradient-text">Synthesis</span>
        </h2>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-gray-400 font-black uppercase tracking-[0.5em] text-[10px]">Prakhar AI is translating vision to reality</p>
          <div className="w-64 h-1 bg-gray-50 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-right from-red-500 via-blue-500 to-yellow-400 animate-loading-bar h-full w-full"></div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;