
import React from 'react';
import { GeneratedImage } from '../types';
import { downloadImage } from '../utils/imageUtils';

interface ImageCardProps { image: GeneratedImage; }

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-square w-full bg-gray-50 overflow-hidden">
        <img 
          src={image.url} 
          alt={image.prompt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4 bg-white border-t border-gray-50">
        <p className="text-sm text-gray-700 line-clamp-2 font-medium mb-3">
          {image.prompt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-[#FF6B00]">
            {image.type}
          </span>
          <button 
            onClick={() => downloadImage(image.url, `prakhar-ai-${image.id}.png`)}
            className="p-2 bg-[#FF6B00] hover:bg-[#E66000] rounded-full transition-colors shadow-sm text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;