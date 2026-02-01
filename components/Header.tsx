
import React from 'react';

interface HeaderProps {
  user: { name: string } | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignInClick, onSignOut }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <div className="flex items-center space-x-3 md:space-x-4">
        <div className="w-10 h-10 md:w-12 md:h-12 relative group">
           <div className="absolute inset-0 gemini-loader-bar rounded-[0.8rem] md:rounded-[1rem] opacity-20 transform rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>
           <div className="absolute inset-0 bg-white border-2 border-[#F0F4F9] rounded-[0.8rem] md:rounded-[1rem] flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-sm overflow-hidden">
               <span className="text-[#1f1f1f] font-black text-xl md:text-2xl tracking-tighter">P</span>
               <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF6B00]"></div>
           </div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#1f1f1f] flex items-center">
            Prakhar<span className="gemini-gradient-text">Ai</span>
          </h1>
          <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mt-1">Version 2.5 Native</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-8">
        <div className="hidden xl:flex space-x-6">
            <a href="#" className="text-[12px] font-bold text-[#444746] hover:text-[#FF6B00] transition-colors tracking-tight uppercase">Showcase</a>
            <a href="#" className="text-[12px] font-bold text-[#444746] hover:text-[#FF6B00] transition-colors tracking-tight uppercase">Features</a>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-3 md:space-x-4 group relative">
            <div className="flex flex-col items-end">
              <span className="text-[12px] md:text-[13px] font-black text-[#1f1f1f] tracking-tight truncate max-w-[80px] md:max-w-none">{user.name}</span>
              <button 
                onClick={onSignOut}
                className="text-[9px] md:text-[10px] font-black text-[#FF6B00] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
              >
                Sign Out
              </button>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FF6B00] p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-[#FF6B00] text-xs md:text-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="group relative flex items-center space-x-2 bg-[#FF6B00] text-white px-5 md:px-7 py-2 md:py-3 rounded-full font-bold text-[12px] md:text-[13px] hover:bg-[#E66000] transition-all shadow-xl shadow-orange-500/10 active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-white transition-colors"></div>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
