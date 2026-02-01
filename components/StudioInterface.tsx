import React, { useState, useRef } from 'react';
import { AspectRatio, GeneratedImage, GenerationConfig } from '../types.ts';
import { generateImage } from '../services/geminiService.ts';
import { fileToBase64 } from '../utils/imageUtils.ts';

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
      setError("Please provide a prompt or an image to redesign.");
      return;
    }

    onGenerationStarted();
    setError(null);

    try {
      const config: GenerationConfig = {
        prompt: prompt || "Redesign this image with premium aesthetic",
        aspectRatio,
        base64Image: uploadData?.data,
        mimeType: uploadData?.mimeType
      };

      const imageUrl = await generateImage(config);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt || "AI Intelligent Redesign",
        timestamp: Date.now(),
        type: uploadData ? 'edit' : 'generation'
      };

      onNewImageCreated(newImage);
      setPrompt('');
      setUploadData(null);
    } catch (err: any) {
      setError("Creative Engine Offline. Check your connection.");
    } finally {
      onGenerationEnded();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto px-4 py-8 md:px-12">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Prakhar <span className="prakhar-gradient-text">Studio</span></h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-1.5 w-8 bg-[#EF4444] rounded-full"></span>
            <span className="h-1.5 w-8 bg-[#3B82F6] rounded-full"></span>
            <span className="h-1.5 w-8 bg-[#FACC15] rounded-full"></span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-2xl space-y-8">
           <div className="space-y-3">
             <label className="text-[11px] font-black text-[#3B82F6] uppercase tracking-widest ml-1">Creation Command</label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe your masterpiece... (e.g., A blue cybernetic lion with red glowing eyes)"
               className="w-full h-32 p-6 bg-gray-50 border-2 border-transparent focus:border-[#FACC15] focus:bg-white rounded-[2rem] outline-none transition-all resize-none font-bold text-gray-800 shadow-inner"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
               <label className="text-[11px] font-black text-[#EF4444] uppercase tracking-widest ml-1">Source Image (Upload)</label>
               {!uploadData ? (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-40 border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:border-[#FACC15] hover:bg-yellow-50 transition-all group"
                 >
                   <svg className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Select Image</span>
                 </button>
               ) : (
                 <div className="relative group rounded-[2rem] overflow-hidden border-4 border-[#FACC15] shadow-xl h-40">
                    <img src={`data:${uploadData.mimeType};base64,${uploadData.data}`} className="w-full h-full object-cover" />
                    <button onClick={() => setUploadData(null)} className="absolute top-3 right-3 p-2 bg-[#EF4444] text-white rounded-xl hover:scale-110 transition-all shadow-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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
                <label className="text-[11px] font-black text-[#3B82F6] uppercase tracking-widest ml-1">Canvas Ratio</label>
                <div className="grid grid-cols-2 gap-3 h-40">
                  {(['1:1', '16:9', '9:16', '4:3'] as AspectRatio[]).map((r) => (
                    <button 
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`rounded-2xl text-[11px] font-black transition-all border-2 ${aspectRatio === r ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-[#3B82F6]'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
             </div>
           </div>

           {error && (
             <div className="p-4 bg-red-50 border-l-4 border-[#EF4444] rounded-r-2xl">
                <p className="text-[#EF4444] text-[11px] font-black uppercase tracking-widest">{error}</p>
             </div>
           )}

           <button 
            onClick={handleGenerate}
            className="w-full py-6 bg-[#EF4444] text-white font-black text-xl rounded-[2rem] hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-100"
           >
             GENERATE ART
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudioInterface;