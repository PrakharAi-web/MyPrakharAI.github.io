
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
      ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'}
      fixed md:relative z-[60] h-full bg-[#FFFFFF] border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-100">
             <span className="text-white font-black text-sm">P</span>
           </div>
           <h1 className="font-black text-lg tracking-tighter">Prakhar<span className="prakhar-gradient-text">Ai</span></h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hidden md:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mt-2">
        <button 
          onClick={onNewChat}
          className="flex items-center space-x-3 w-full px-5 py-3 bg-white border-2 border-red-50 hover:border-red-500 hover:text-red-500 rounded-2xl text-sm font-bold text-gray-700 transition-all group shadow-sm"
        >
          <svg className="w-5 h-5 text-red-500 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New session</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto mt-6 px-3 custom-scrollbar">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-3 w-full p-3 rounded-xl text-sm transition-all ${activeView === 'chat' && !activeChatId ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-500 font-semibold'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span>AI Messenger</span>
          </button>
          <button 
            onClick={() => setActiveView('studio')}
            className={`flex items-center space-x-3 w-full p-3 rounded-xl text-sm transition-all ${activeView === 'studio' ? 'bg-yellow-50 text-yellow-600 font-bold' : 'hover:bg-gray-50 text-gray-500 font-semibold'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Art Studio</span>
          </button>
        </div>

        {/* Recent Chats Section */}
        {chats.length > 0 && (
          <div className="mt-8">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Memory</p>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button 
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center space-x-3 w-full p-2 rounded-xl text-xs transition-all truncate pr-8 ${activeChatId === chat.id ? 'bg-gray-100 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-500 font-medium'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeChatId === chat.id ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button 
                    onClick={(e) => onDeleteChat(e, chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Creations Section */}
        <div className="mt-8">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Creations</p>
          <div className="grid grid-cols-2 gap-2 px-2">
            {images.slice(0, 6).map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <button 
                  onClick={(e) => onDeleteImage(e, img.id)}
                  className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shadow-sm"
                >
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
          </div>
          {images.length === 0 && <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Zero gallery items</p>}
        </div>
      </nav>

      {/* Sidebar Footer / Profile */}
      <div className="p-4 border-t border-gray-50">
        {user ? (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tight">Verified Profile</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="flex items-center space-x-3 w-full p-4 rounded-xl text-sm text-red-500 font-black uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
