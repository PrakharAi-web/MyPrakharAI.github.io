
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
      setError("Input required: Description or Reference Image.");
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
        prompt: prompt || "Intelligent Redesign",
        timestamp: Date.now(),
        type: uploadData ? 'edit' : 'generation'
      };

      onNewImageCreated(newImage);
      setPrompt('');
      setUploadData(null);
    } catch (err: any) {
      setError(err.message || "Creative engine failure.");
    } finally {
      onGenerationEnded();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto px-4 py-8 md:px-12 custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Art <span className="prakhar-gradient-text">Studio</span></h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-1 w-12 bg-red-500 rounded-full"></span>
            <span className="h-1 w-12 bg-blue-500 rounded-full"></span>
            <span className="h-1 w-12 bg-yellow-400 rounded-full"></span>
          </div>
        </div>

        <div className="bg-gray-50/50 p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-8">
           <div className="space-y-3">
             <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1">Creation Prompt</label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="A surreal landscape using Red and Blue light, golden sun peaks..."
               className="w-full h-36 p-6 bg-white border-2 border-gray-50 rounded-[2rem] focus:border-yellow-400 outline-none transition-all resize-none font-bold text-gray-700 text-lg shadow-inner"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
               <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1">Reference Image (Optional)</label>
               {!uploadData ? (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                 >
                   <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-xs font-black uppercase tracking-wider">Upload Reference</span>
                 </button>
               ) : (
                 <div className="relative group rounded-[2rem] overflow-hidden border-4 border-yellow-400 shadow-xl h-40">
                    <img src={`data:${uploadData.mimeType};base64,${uploadData.data}`} className="w-full h-full object-cover" />
                    <button onClick={() => setUploadData(null)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg">
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
                <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1">Dimensions</label>
                <div className="grid grid-cols-2 gap-3 h-40">
                  {(['1:1', '16:9', '9:16', '4:3'] as AspectRatio[]).map((r) => (
                    <button 
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`rounded-2xl text-sm font-black transition-all border-2 ${aspectRatio === r ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-yellow-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
             </div>
           </div>

           {error && (
             <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl">
                <p className="text-red-600 text-[11px] font-black uppercase tracking-widest">{error}</p>
             </div>
           )}

           <button 
            onClick={handleGenerate}
            className="w-full py-6 bg-red-500 text-white font-black text-xl rounded-[2rem] hover:bg-red-600 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl shadow-red-200"
           >
             CRAFT MASTERPIECE
           </button>
        </div>
        
        <div className="mt-12 text-center pb-20">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Powered by Prakhar AI Creative Core</p>
        </div>
      </div>
    </div>
  );
};

export default StudioInterface;
