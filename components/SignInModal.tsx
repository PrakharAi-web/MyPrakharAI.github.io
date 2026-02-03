
import React, { useState } from 'react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (name: string) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSignIn(name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-gray-100 p-10 relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
            Unlock <span className="prakhar-gradient-text">Private Access</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium">Personalize your Prakhar AI experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Sharma"
              className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-100 transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-[#EF4444] text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-500/10 active:scale-95">
            Start Personalized Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
