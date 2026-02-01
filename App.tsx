
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
    try {
      const savedImages = localStorage.getItem('prakhar_ai_images');
      if (savedImages) setImages(JSON.parse(savedImages));

      const savedChats = localStorage.getItem('prakhar_ai_chats');
      if (savedChats) setChats(JSON.parse(savedChats));
    } catch (e) {
      console.warn("History failed to load from local storage.");
    }
  }, []);

  const saveImage = (img: GeneratedImage) => {
    const newImages = [img, ...images];
    setImages(newImages);
    localStorage.setItem('prakhar_ai_images', JSON.stringify(newImages));
  };

  const handleUpdateChat = (id: string, messages: ChatMessage[], title?: string) => {
    setChats(prev => {
      const existing = prev.find(c => c.id === id);
      let newChats;
      if (existing) {
        newChats = prev.map(c => c.id === id ? { ...c, messages, title: title || c.title } : c);
      } else {
        newChats = [{ id, messages, title: title || "New Chat", timestamp: Date.now() }, ...prev];
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
    const newChats = chats.filter(c => c.id !== id);
    setChats(newChats);
    localStorage.setItem('prakhar_ai_chats', JSON.stringify(newChats));
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleDeleteImage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newImages = images.filter(img => img.id !== id);
    setImages(newImages);
    localStorage.setItem('prakhar_ai_images', JSON.stringify(newImages));
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewChat={handleNewChat}
        user={user}
        onSignInClick={() => setIsSignInModalOpen(true)}
        images={images}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onDeleteImage={handleDeleteImage}
      />

      <main className="flex-1 flex flex-col transition-all duration-300 relative overflow-hidden">
        <header className="md:hidden p-4 border-b flex items-center justify-between bg-white z-50">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-xl font-black tracking-tighter">Prakhar<span className="text-[#FF6B00]">Ai</span></h1>
          <div className="w-10"></div>
        </header>

        {loading && <LoadingOverlay />}

        <div className="flex-1 overflow-hidden">
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
        onSignIn={(name) => setUser({ name })}
      />
    </div>
  );
};

export default App;
