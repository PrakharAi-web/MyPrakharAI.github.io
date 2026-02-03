
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import StudioInterface from './components/StudioInterface.tsx';
import SignInModal from './components/SignInModal.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import { GeneratedImage, ChatMessage } from './types.ts';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

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
    // Hide original splash screen immediately once React is mounted
    const loader = document.getElementById('app-loading-screen');
    if (loader) {
      loader.classList.add('hidden-loader');
    }

    try {
      const savedImages = localStorage.getItem('prakhar_ai_images');
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        if (Array.isArray(parsed)) setImages(parsed);
      }

      const savedChats = localStorage.getItem('prakhar_ai_chats');
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed)) setChats(parsed);
      }
      
      const savedUser = localStorage.getItem('prakhar_ai_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      }
    } catch (e) {
      console.warn("Prakhar AI: Hydration failed.");
    }
  }, []);

  const saveImage = (img: GeneratedImage) => {
    setImages(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const newImages = [img, ...current];
      localStorage.setItem('prakhar_ai_images', JSON.stringify(newImages));
      return newImages;
    });
  };

  const handleUpdateChat = (id: string, messages: ChatMessage[], title?: string) => {
    setChats(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const existing = current.find(c => c.id === id);
      let newChats;
      if (existing) {
        newChats = current.map(c => c.id === id ? { ...c, messages, title: title || c.title } : c);
      } else {
        newChats = [{ id, messages, title: title || "New Chat", timestamp: Date.now() }, ...current];
      }
      localStorage.setItem('prakhar_ai_chats', JSON.stringify(newChats));
      return newChats;
    });
  };

  const handleNewChat = () => {
    setActiveView('chat');
    setActiveChatId(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveView('chat');
    setActiveChatId(id);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChats(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const newChats = current.filter(c => c.id !== id);
      localStorage.setItem('prakhar_ai_chats', JSON.stringify(newChats));
      return newChats;
    });
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleDeleteImage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setImages(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const newImages = current.filter(img => img.id !== id);
      localStorage.setItem('prakhar_ai_images', JSON.stringify(newImages));
      return newImages;
    });
  };

  const handleSignIn = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem('prakhar_ai_user', JSON.stringify(newUser));
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewChat={handleNewChat}
        user={user}
        onSignInClick={() => setIsSignInModalOpen(true)}
        images={Array.isArray(images) ? images : []}
        chats={Array.isArray(chats) ? chats : []}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onDeleteImage={handleDeleteImage}
      />

      <main className="flex-1 flex flex-col transition-all duration-300 relative overflow-hidden bg-white">
        <header className="md:hidden p-4 border-b flex items-center justify-between bg-white z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-xl font-black tracking-tighter italic">
            Prakhar<span className="prakhar-gradient-text">Ai</span>
          </h1>
          <div className="w-10"></div>
        </header>

        {loading && <LoadingOverlay />}

        <div className="flex-1 overflow-hidden relative">
          {activeView === 'chat' ? (
            <ChatInterface 
              key={activeChatId || 'new'}
              user={user} 
              initialMessages={Array.isArray(chats) ? (chats.find(c => c.id === activeChatId)?.messages || []) : []}
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
