import React from 'react';

interface HeaderProps {
  user: { name: string } | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignInClick, onSignOut }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[#EF4444] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
          <span className="text-white font-black text-xl">P</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter flex items-center">
            Prakhar<span className="prakhar-gradient-text">Ai</span>
          </h1>
          <div className="h-1 w-full bg-blue-500 rounded-full mt-0.5 opacity-20"></div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[#1a1a1a] leading-none tracking-tight">{user.name}</p>
              <button onClick={onSignOut} className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-wider hover:underline">Exit</button>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FACC15] border-2 border-white shadow-md flex items-center justify-center font-bold text-gray-800">
              {user.name.charAt(0)}
            </div>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="px-6 py-2 bg-[#EF4444] text-white font-bold rounded-full text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;