import React from 'react';
import { GeneratedImage } from '../types.ts';
import { downloadImage } from '../utils/imageUtils.ts';

interface ImageCardProps { image: GeneratedImage; }

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-red-50 text-[#EF4444] rounded-full">
            {image.type}
          </span>
          <button 
            onClick={() => downloadImage(image.url, `prakhar-ai-${image.id}.png`)}
            className="p-2.5 bg-[#3B82F6] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" /></svg>
          </button>
        </div>
        <p className="text-sm text-gray-700 font-bold leading-relaxed line-clamp-2 tracking-tight">{image.prompt}</p>
      </div>
    </div>
  );
};

export default ImageCard;