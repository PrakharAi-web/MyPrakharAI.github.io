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
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { name: 'Architectural', prompt: 'clean white geometric architecture, luxury aesthetic, sharp lines, blue ambient lighting', color: 'border-blue-500 bg-blue-50 text-blue-600' },
    { name: 'Futurism', prompt: 'cyberpunk vibrant red and yellow neons, futuristic city, highly detailed digital art', color: 'border-red-500 bg-red-50 text-red-600' },
    { name: 'Minimalist', prompt: 'single object, pure white background, dramatic red shadow, minimalist professional photography', color: 'border-gray-900 bg-gray-50 text-gray-900' },
    { name: 'Abstract', prompt: 'abstract flow of blue, red and yellow energy, smooth gradients, 8k wallpaper', color: 'border-yellow-500 bg-yellow-50 text-yellow-700' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadData && !selectedPreset) {
      setError("Provide a vision or select a preset to begin.");
      return;
    }

    onGenerationStarted();
    setError(null);

    const finalPrompt = selectedPreset 
      ? `${prompt} ${presets.find(p => p.name === selectedPreset)?.prompt}`.trim() 
      : prompt;

    try {
      const config: GenerationConfig = {
        prompt: finalPrompt || "Prakhar AI Creative Masterpiece",
        aspectRatio,
        base64Image: uploadData?.data,
        mimeType: uploadData?.mimeType
      };

      const imageUrl = await generateImage(config);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        type: uploadData ? 'edit' : 'generation'
      };

      onNewImageCreated(newImage);
      setPrompt('');
      setUploadData(null);
      setSelectedPreset(null);
    } catch (err: any) {
      setError("The Creative Engine encountered an anomaly. Please re-execute.");
    } finally {
      onGenerationEnded();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto px-6 py-12 md:px-20 custom-scrollbar relative">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center space-x-4 mb-4">
            <span className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-100">Engine V2.5</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          <h2 className="text-7xl font-black tracking-tighter italic mb-4">Art <span className="prakhar-gradient-text">Studio</span></h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.4em]">Where intelligence meets aesthetic.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Input Area */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
               <label className="flex items-center space-x-3 text-[11px] font-black text-gray-800 uppercase tracking-[0.3em]">
                 <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg">1</div>
                 <span>Visual Concept</span>
               </label>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Translate your thoughts into pixels... (e.g. A solitary astronaut exploring a red desert under a blue moon)"
                 className="w-full h-56 p-10 bg-gray-50/50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-[3rem] outline-none transition-all resize-none font-bold text-gray-800 shadow-inner text-xl leading-relaxed placeholder:text-gray-300"
               />
            </div>

            {/* Presets Grid */}
            <div className="space-y-6">
               <label className="flex items-center space-x-3 text-[11px] font-black text-gray-800 uppercase tracking-[0.3em]">
                 <div className="w-6 h-6 rounded-lg bg-yellow-500 flex items-center justify-center text-white shadow-lg">2</div>
                 <span>Aesthetic Presets</span>
               </label>
               <div className="grid grid-cols-2 gap-4">
                 {presets.map((p) => (
                   <button 
                     key={p.name}
                     onClick={() => setSelectedPreset(selectedPreset === p.name ? null : p.name)}
                     className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${selectedPreset === p.name ? p.color + ' shadow-xl' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                   >
                     <p className="text-xs font-black uppercase tracking-widest mb-1">{p.name}</p>
                     <p className="text-[10px] opacity-60 font-medium line-clamp-1">{p.prompt}</p>
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center space-x-3 text-[11px] font-black text-gray-800 uppercase tracking-[0.3em]">
                <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-lg">3</div>
                <span>Reference Synthesis</span>
              </label>
              {!uploadData ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="p-6 bg-white rounded-full mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inject Base Asset</span>
                </button>
              ) : (
                <div className="relative group rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl h-64">
                   <img src={`data:${uploadData.mimeType};base64,${uploadData.data}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <button onClick={() => setUploadData(null)} className="px-8 py-4 bg-red-500 text-white rounded-[1.5rem] hover:scale-110 transition-all shadow-xl font-black text-xs uppercase tracking-widest">
                       Purge Memory
                     </button>
                   </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" 
               onChange={async (e) => {
                 const f = e.target.files?.[0];
                 if (f) setUploadData(await fileToBase64(f));
               }}
              />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-12 space-y-12">
              <div className="space-y-6">
                 <label className="flex items-center space-x-3 text-[11px] font-black text-gray-800 uppercase tracking-[0.3em]">
                   <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-lg">4</div>
                   <span>Canvas Format</span>
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                   {(['1:1', '16:9', '9:16', '4:3'] as AspectRatio[]).map((r) => (
                     <button 
                       key={r}
                       onClick={() => setAspectRatio(r)}
                       className={`py-8 rounded-[2rem] text-[13px] font-black transition-all border-2 flex flex-col items-center justify-center space-y-4 ${aspectRatio === r ? 'bg-blue-500 border-blue-500 text-white shadow-2xl shadow-blue-100 scale-[1.05]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                     >
                       <div className={`border-2 rounded-sm transition-colors ${aspectRatio === r ? 'border-white' : 'border-gray-200'} ${r === '1:1' ? 'w-6 h-6' : r === '16:9' ? 'w-10 h-6' : r === '9:16' ? 'w-4 h-10' : 'w-8 h-6'}`}></div>
                       <span className="uppercase tracking-widest">{r}</span>
                     </button>
                   ))}
                 </div>
              </div>

              <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/20 transition-all"></div>
                
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10">Neural Parameters</h4>
                <div className="space-y-6 mb-12">
                  <div className="flex items-center justify-between group/row">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/row:text-white transition-colors">Core Model</span>
                    <span className="text-[10px] text-red-500 font-black mono px-3 py-1 bg-red-500/5 rounded-full">FLASH_2.5_GEN</span>
                  </div>
                  <div className="flex items-center justify-between group/row">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/row:text-white transition-colors">Creative Flux</span>
                    <span className="text-[10px] text-blue-400 font-black mono px-3 py-1 bg-blue-400/5 rounded-full">DYNAMIC</span>
                  </div>
                  <div className="flex items-center justify-between group/row">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/row:text-white transition-colors">Output Resolution</span>
                    <span className="text-[10px] text-yellow-400 font-black mono px-3 py-1 bg-yellow-400/5 rounded-full">1024_NATIVE</span>
                  </div>
                </div>

                <div className="pt-4">
                  {error && (
                    <div className="mb-6 p-5 bg-red-500/10 border-l-4 border-red-500 rounded-r-2xl animate-in slide-in-from-left-2">
                       <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
                    </div>
                  )}
                  <button 
                   onClick={handleGenerate}
                   className="w-full py-8 bg-red-500 text-white font-black text-xl rounded-[2rem] hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-500/20 uppercase tracking-widest italic"
                  >
                    Generate Art
                  </button>
                  <p className="mt-6 text-center text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] opacity-40 italic">Developed by Prakhar Sharma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioInterface;