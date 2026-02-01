
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageCard from './components/ImageCard';
import LoadingOverlay from './components/LoadingOverlay';
import ChatInterface from './components/ChatInterface';
import SignInModal from './components/SignInModal';
import { GeneratedImage, AspectRatio, GenerationConfig } from './types';
import { generateImage } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'chat'>('chat');
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [uploadData, setUploadData] = useState<{ data: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await fileToBase64(file);
        setUploadData(data);
        setError(null);
      } catch (err) {
        setError("Failed to process image file.");
      }
    }
  };

  const clearUpload = () => {
    setUploadData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadData) {
      setError("Please provide a prompt or an image to start.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config: GenerationConfig = {
        prompt: prompt,
        aspectRatio: aspectRatio,
        base64Image: uploadData?.data,
        mimeType: uploadData?.mimeType
      };

      const imageUrl = await generateImage(config);
      
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: prompt || (uploadData ? "Edited Upload" : "Untitled Generation"),
        timestamp: Date.now(),
        type: uploadData ? 'edit' : 'generation'
      };

      setImages(prev => [newImage, ...prev]);
      setPrompt('');
      clearUpload();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <Header 
        user={user} 
        onSignInClick={() => setIsSignInModalOpen(true)} 
        onSignOut={() => setUser(null)}
      />

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
        onSignIn={(name) => setUser({ name })}
      />

      {loading && <LoadingOverlay />}

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-12 mb-4">
        <div className="bg-gray-100 p-1.5 rounded-[2rem] inline-flex">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-8 md:px-10 py-3 md:py-3.5 rounded-[1.8rem] text-[14px] md:text-[15px] font-bold transition-all ${
              activeTab === 'chat' ? 'bg-white text-[#1f1f1f] shadow-sm transform scale-105' : 'text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('studio')}
            className={`px-8 md:px-10 py-3 md:py-3.5 rounded-[1.8rem] text-[14px] md:text-[15px] font-bold transition-all ${
              activeTab === 'studio' ? 'bg-white text-[#1f1f1f] shadow-sm transform scale-105' : 'text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Studio
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {activeTab === 'studio' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
            {/* Sidebar / Controls */}
            <section className="lg:col-span-4 space-y-10">
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-orange-500/5 border border-gray-100 flex flex-col space-y-10">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                    Creative Prompt
                  </label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to create..."
                    className="w-full h-44 p-6 bg-gray-100 border-none rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all resize-none text-[#1f1f1f] placeholder-gray-400 font-medium text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                    Reference Image
                  </label>
                  <div className="relative">
                    {!uploadData ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 hover:bg-gray-100 transition-all group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-gray-300 group-hover:text-[#FF6B00] transition-all mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[13px] font-bold text-gray-400">Select Source Image</span>
                      </button>
                    ) : (
                      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-white">
                        <img src={`data:${uploadData.mimeType};base64,${uploadData.data}`} className="w-full h-full object-cover" alt="Upload preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                            onClick={clearUpload}
                            className="bg-red-600 text-white p-4 rounded-full hover:scale-110 transition-transform shadow-2xl"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                    Layout Aspect
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['1:1', '3:4', '4:3', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 md:px-4 py-2 md:py-2.5 rounded-[1rem] text-[11px] md:text-[12px] font-bold transition-all border-2 ${
                          aspectRatio === ratio 
                          ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-lg transform scale-110' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-[13px] font-bold rounded-2xl uppercase tracking-wider text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#FF6B00] hover:bg-[#E66000] text-white py-5 md:py-6 rounded-[2rem] font-bold text-base md:text-lg shadow-xl shadow-orange-500/10 transition-all transform active:scale-95 flex items-center justify-center space-x-4 tracking-wide"
                >
                  <span className="uppercase">{uploadData ? 'Redesign Image' : 'Generate Art'}</span>
                  <div className="w-6 h-6 gemini-loader-bar rounded-full opacity-50"></div>
                </button>
              </div>
            </section>

            {/* Gallery Section */}
            <section className="lg:col-span-8">
              <div className="mb-12">
                <h2 className="text-4xl md:text-6xl font-black text-[#1f1f1f] tracking-tighter mb-4 leading-none">
                  Your <span className="gemini-gradient-text">Creation</span>
                </h2>
                <div className="flex items-center space-x-3 text-[13px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                   <div className="w-3 h-3 bg-[#FF6B00] rounded-full"></div>
                   <span>AI Generation Engine Active</span>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 md:py-40 px-10 bg-gray-50 border-4 border-dashed border-white rounded-[3rem] md:rounded-[4rem] text-center">
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <div className="w-10 h-10 md:w-12 md:h-12 gemini-loader-bar rounded-full opacity-20"></div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-300 mb-2 tracking-tight">CANVAS EMPTY</h3>
                  <p className="text-gray-300 max-w-xs font-bold text-[13px] uppercase tracking-widest leading-relaxed">
                    Visualizations will appear here after generation.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                  {images.map((img) => (
                    <ImageCard key={img.id} image={img} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Chat Section */
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8 md:mb-16">
                <h2 className="text-5xl md:text-7xl font-black text-[#1f1f1f] tracking-tighter leading-none mb-6">
                  {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Hello, Prakhar AI'}
                </h2>
                <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF6B00]/30 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-[#FFB800]/30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#FF6B00]/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <ChatInterface user={user} onSignInClick={() => setIsSignInModalOpen(true)} />
            </div>
          </section>
        )}
      </main>

      <footer className="bg-transparent py-20 px-6 mt-16 border-t border-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-12">
          <div className="flex space-x-2">
            <div className="w-5 h-5 bg-[#FF6B00] rounded-full shadow-2xl shadow-orange-500/20"></div>
            <div className="w-5 h-5 bg-white border-2 border-gray-100 rounded-full"></div>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <span className="text-xl md:text-2xl font-black text-[#1f1f1f] tracking-tighter uppercase">Prakhar AI Suite</span>
            <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] opacity-60">Orange & White Edition</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40">
            <a href="#" className="text-[10px] md:text-[11px] font-black text-[#1f1f1f] hover:text-[#FF6B00] transition-colors uppercase tracking-[0.3em]">Identity</a>
            <a href="#" className="text-[10px] md:text-[11px] font-black text-[#1f1f1f] hover:text-[#FF6B00] transition-colors uppercase tracking-[0.3em]">Intelligence</a>
            <a href="#" className="text-[10px] md:text-[11px] font-black text-[#1f1f1f] hover:text-[#FF6B00] transition-colors uppercase tracking-[0.3em]">Ethics</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;