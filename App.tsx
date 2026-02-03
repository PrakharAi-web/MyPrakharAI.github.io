
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import StudioInterface from './components/StudioInterface.tsx';
import SignInModal from './components/SignInModal.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import { GeneratedImage, ChatMessage, ChatSession } from './types.ts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'studio'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Dismiss original HTML splash screen
    const loader = document.getElementById('app-loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.classList.add('hidden-loader'), 500);
    }

    // 2. Safely Hydrate State
    try {
      const savedImages = localStorage.getItem('prakhar_v3_images');
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        if (Array.isArray(parsed)) setImages(parsed);
      }

      const savedChats = localStorage.getItem('prakhar_v3_chats');
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed)) setChats(parsed);
      }
      
      const savedUser = localStorage.getItem('prakhar_v3_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) setUser(parsed);
      }
    } catch (e) {
      console.warn("Prakhar AI: Storage reset due to corruption.");
      localStorage.clear();
    }
  }, []);

  const saveImage = (img: GeneratedImage) => {
    setImages(prev => {
      const updated = [img, ...prev];
      localStorage.setItem('prakhar_v3_images', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateChat = (id: string, messages: ChatMessage[], title?: string) => {
    setChats(prev => {
      const existing = prev.find(c => c.id === id);
      let next;
      if (existing) {
        next = prev.map(c => c.id === id ? { ...c, messages, title: title || c.title } : c);
      } else {
        next = [{ id, messages, title: title || "Analysis Session", timestamp: Date.now() }, ...prev];
      }
      localStorage.setItem('prakhar_v3_chats', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      localStorage.setItem('prakhar_v3_chats', JSON.stringify(filtered));
      return filtered;
    });
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleSignIn = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem('prakhar_v3_user', JSON.stringify(newUser));
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans selection:bg-red-100 selection:text-red-600">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewChat={() => { setActiveView('chat'); setActiveChatId(null); }}
        user={user}
        onSignInClick={() => setIsSignInModalOpen(true)}
        images={images}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveView('chat'); setActiveChatId(id); }}
        onDeleteChat={handleDeleteChat}
      />

      <main className="flex-1 flex flex-col transition-all duration-300 relative overflow-hidden bg-white">
        <header className="md:hidden p-5 border-b flex items-center justify-between bg-white z-50">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-xl font-black italic">Prakhar<span className="prakhar-gradient-text">Ai</span></h1>
          <div className="w-10"></div>
        </header>

        {loading && <LoadingOverlay />}

        <div className="flex-1 overflow-hidden relative">
          {activeView === 'chat' ? (
            <ChatInterface 
              key={activeChatId || 'new'}
              user={user} 
              initialMessages={chats.find(c => c.id === activeChatId)?.messages || []}
              chatId={activeChatId}
              onGenerationStarted={() => setLoading(true)}
              onGenerationEnded={() => setLoading(false)}
              onNewImageCreated={saveImage}
              onUpdateHistory={handleUpdateChat}
              onSetActiveChat={setActiveChatId}
            />
          ) : (
            <StudioInterface 
              user={user} 
              onNewImageCreated={saveImage}
              onGenerationStarted={() => setLoading(true)}
              onGenerationEnded={() => setLoading(false)}
            />
          )}
        </div>
      </main>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
        onSignIn={handleSignIn}
      />
    </div>
  );
};

export default App;
