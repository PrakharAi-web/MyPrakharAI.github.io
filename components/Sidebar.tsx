
import React from 'react';
import { GeneratedImage, ChatSession } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeView: 'chat' | 'studio';
  setActiveView: (view: 'chat' | 'studio') => void;
  onNewChat: () => void;
  user: { name: string } | null;
  onSignInClick: () => void;
  images: GeneratedImage[];
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, setIsOpen, activeView, setActiveView, onNewChat, user, onSignInClick, images, chats, activeChatId, onSelectChat, onDeleteChat
}) => {
  return (
    <aside className={`
      ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0'}
      fixed md:relative z-[60] h-full bg-white border-r border-gray-100 transition-all duration-500 flex flex-col
    `}>
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
            <span className="text-white font-black text-xl">P</span>
          </div>
          <h1 className="font-black text-2xl tracking-tighter italic">Prakhar<span className="prakhar-gradient-text">Ai</span></h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-6 py-4">
        <button 
          onClick={onNewChat}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-500 hover:shadow-2xl active:scale-95"
        >
          Initiate Session
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chat' && !activeChatId ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <div className={`p-2 rounded-xl ${activeView === 'chat' && !activeChatId ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <span>Dialogue</span>
          </button>
          
          <button 
            onClick={() => setActiveView('studio')}
            className={`flex items-center space-x-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'studio' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <div className={`p-2 rounded-xl ${activeView === 'studio' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span>Studio</span>
          </button>
        </div>

        {chats.length > 0 && (
          <div className="mt-10">
            <h3 className="px-5 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Neural Logs</h3>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative px-2">
                  <button 
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center space-x-3 w-full p-3 rounded-xl text-xs transition-all truncate pr-10 ${activeChatId === chat.id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <span className="truncate italic">{chat.title}</span>
                  </button>
                  <button onClick={(e) => onDeleteChat(e, chat.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-10 mb-8">
            <h3 className="px-5 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Asset Feed</h3>
            <div className="grid grid-cols-2 gap-3 px-3">
              {images.slice(0, 4).map((img) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={img.url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-gray-50">
        {user ? (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-black">{user.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Active Partner</p>
            </div>
          </div>
        ) : (
          <button onClick={onSignInClick} className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all">
            Identity Access
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
