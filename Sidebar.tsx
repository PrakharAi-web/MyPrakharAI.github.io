import React from 'react';
import { GeneratedImage } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeView: 'chat' | 'studio';
  setActiveView: (view: 'chat' | 'studio') => void;
  onNewChat: () => void;
  user: { name: string } | null;
  onSignInClick: () => void;
  images: GeneratedImage[];
  chats: any[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onDeleteImage: (e: React.MouseEvent, id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  activeView, 
  setActiveView, 
  onNewChat,
  user, 
  onSignInClick,
  images,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onDeleteImage
}) => {
  return (
    <aside className={`
      ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0'}
      fixed md:relative z-[60] h-full bg-white/80 backdrop-blur-xl border-r border-gray-100 transition-all duration-500 ease-in-out flex flex-col
    `}>
      {/* Brand Section */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer">
             <span className="text-white font-black text-xl">P</span>
           </div>
           <div>
             <h1 className="font-black text-2xl tracking-tighter italic">Prakhar<span className="prakhar-gradient-text">Ai</span></h1>
             <div className="flex items-center space-x-2 mt-1">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neural Online</span>
             </div>
           </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Main Actions */}
      <div className="px-6 py-6">
        <button 
          onClick={onNewChat}
          className="group flex items-center justify-center space-x-3 w-full px-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:shadow-2xl hover:shadow-red-200 active:scale-95"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          <span>Initiate Session</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-3 w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'chat' && !activeChatId ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <div className={`p-2 rounded-xl ${activeView === 'chat' && !activeChatId ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <span>Dialogue</span>
          </button>
          
          <button 
            onClick={() => setActiveView('studio')}
            className={`flex items-center space-x-3 w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'studio' ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <div className={`p-2 rounded-xl ${activeView === 'studio' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' : 'bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span>Art Engine</span>
          </button>
        </div>

        {/* History Sections */}
        {chats.length > 0 && (
          <div className="mt-10">
            <h3 className="px-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Neural Logs</h3>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative px-2">
                  <button 
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center space-x-3 w-full p-3 rounded-xl text-xs transition-all truncate pr-10 ${activeChatId === chat.id ? 'bg-blue-50/50 text-blue-600 font-bold border border-blue-100' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <div className={`w-1 h-4 rounded-full ${activeChatId === chat.id ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button 
                    onClick={(e) => onDeleteChat(e, chat.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creative Asset Feed */}
        <div className="mt-10 mb-8">
          <div className="flex items-center justify-between px-5 mb-4">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Asset Feed</h3>
            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{images.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-3">
            {images.slice(0, 4).map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border-2 border-transparent hover:border-red-500 transition-all bg-gray-50">
                <img src={img.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
                <button 
                  onClick={(e) => onDeleteImage(e, img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shadow-lg"
                >
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-2 h-24 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
                <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Awaiting Creation</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Identity Core */}
      <div className="p-6 border-t border-gray-50">
        {user ? (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 group cursor-default">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100 transform group-hover:scale-110 transition-transform">
                {user.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 border-4 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Active Partner</span>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="flex items-center justify-center space-x-3 w-full p-5 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] text-xs text-gray-400 font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span>Identify Access</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;