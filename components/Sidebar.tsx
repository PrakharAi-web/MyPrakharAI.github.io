
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
      fixed md:relative z-[60] h-full bg-[#f8fafc] border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-md">
             <span className="text-white font-black text-sm">P</span>
           </div>
           <h1 className="font-black text-lg tracking-tighter">Prakhar<span className="text-[#FF6B00]">Ai</span></h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hidden md:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mt-2">
        <button 
          onClick={onNewChat}
          className="flex items-center space-x-3 w-fit px-5 py-3 bg-white border border-gray-100 hover:shadow-md rounded-full text-sm font-bold text-gray-700 transition-all group"
        >
          <svg className="w-5 h-5 text-[#FF6B00] group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New chat</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto mt-6 px-3 custom-scrollbar">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-sm transition-all ${activeView === 'chat' && !activeChatId ? 'sidebar-item-active text-[#FF6B00]' : 'sidebar-item-hover text-gray-600 font-semibold'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span>Live Chat</span>
          </button>
          <button 
            onClick={() => setActiveView('studio')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-sm transition-all ${activeView === 'studio' ? 'sidebar-item-active text-[#FF6B00]' : 'sidebar-item-hover text-gray-600 font-semibold'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Image Studio</span>
          </button>
        </div>

        {/* Recent Chats Section */}
        {chats.length > 0 && (
          <div className="mt-8">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Chats</p>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button 
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center space-x-3 w-full p-2 rounded-xl text-xs transition-all truncate pr-8 ${activeChatId === chat.id ? 'sidebar-item-active text-[#FF6B00]' : 'sidebar-item-hover text-gray-500 font-medium'}`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
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
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Gallery</p>
          <div className="space-y-1">
            {images.slice(0, 15).map((img) => (
              <div key={img.id} className="group relative">
                <button 
                  onClick={() => { setActiveView('studio'); }}
                  className="flex items-center space-x-3 w-full p-2 rounded-xl text-xs text-gray-500 sidebar-item-hover truncate"
                >
                  <img src={img.url} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shadow-sm" />
                  <span className="truncate font-medium">{img.prompt}</span>
                </button>
                <button 
                  onClick={(e) => onDeleteImage(e, img.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                >
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
            {images.length === 0 && <p className="px-4 text-xs text-gray-400 italic font-medium">No creations yet</p>}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer / Profile */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
          <div className="flex items-center space-x-3 p-2 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="w-8 h-8 rounded-full bg-[#FFB800] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-sm text-[#FF6B00] font-black uppercase tracking-wider sidebar-item-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
