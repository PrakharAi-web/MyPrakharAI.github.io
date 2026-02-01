
import React, { useState, useRef } from 'react';
import { AspectRatio, GeneratedImage, GenerationConfig } from '../types.ts';
import { generateImage } from '../services/geminiService.ts';
import { fileToBase64 } from '../utils/imageUtils.ts';
import ImageCard from './ImageCard.tsx';

interface StudioInterfaceProps {
  user: { name: string } | null;
  onNewImageCreated: (img: GeneratedImage) => void;
  onGenerationStarted: () => void;
  onGenerationEnded: () => void;
}

const StudioInterface: React.FC<StudioInterfaceProps> = ({ onNewImageCreated, onGenerationStarted, onGenerationEnded }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [uploadData, setUploadData] = useState<{ data: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadData) {
      setError("Please provide a prompt or an image.");
      return;
    }

    onGenerationStarted();
    setError(null);

    try {
      const config: GenerationConfig = {
        prompt,
        aspectRatio,
        base64Image: uploadData?.data,
        mimeType: uploadData?.mimeType
      };

      const imageUrl = await generateImage(config);
      
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: prompt || "Redesigned image",
        timestamp: Date.now(),
        type: uploadData ? 'edit' : 'generation'
      };

      onNewImageCreated(newImage);
      setPrompt('');
      setUploadData(null);
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      onGenerationEnded();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto px-4 py-8 md:px-12 custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-tighter mb-2">Image <span className="gemini-gradient-text">Studio</span></h2>
          <p className="text-gray-400 font-medium">Create and edit visuals with Prakhar AI</p>
        </div>

        <div className="bg-[#f8fafc] p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
           <div className="space-y-3">
             <label className="text-[11px] font-black text-[#FF6B00] uppercase tracking-widest ml-1">Describe your vision</label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="A cyberpunk city with neon orange lights..."
               className="w-full h-32 p-6 bg-white border border-gray-100 rounded-3xl focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none font-medium text-gray-700"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Reference Frame</label>
               {!uploadData ? (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full py-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-[#FF6B00] hover:bg-orange-50 transition-all"
                 >
                   <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   <span className="text-xs font-bold">Add Image</span>
                 </button>
               ) : (
                 <div className="relative group rounded-3xl overflow-hidden border-2 border-[#FF6B00]">
                    <img src={`data:${uploadData.mimeType};base64,${uploadData.data}`} className="w-full h-32 object-cover" />
                    <button onClick={() => setUploadData(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                 </div>
               )}
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" 
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setUploadData(await fileToBase64(f));
                }}
               />
             </div>

             <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1:1', '16:9', '9:16'] as AspectRatio[]).map((r) => (
                    <button 
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border ${aspectRatio === r ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
             </div>
           </div>

           {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

           <button 
            onClick={handleGenerate}
            className="w-full py-5 bg-[#FF6B00] text-white font-black rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-100"
           >
             Create Masterpiece
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudioInterface;
