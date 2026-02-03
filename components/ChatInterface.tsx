import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { ChatMessage, GeneratedImage, AppTimer } from '../types.ts';
import { fileToBase64 } from '../utils/imageUtils.ts';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils.ts';

interface ChatInterfaceProps {
  user: { name: string } | null;
  initialMessages?: ChatMessage[];
  chatId: string | null;
  onGenerationStarted?: () => void;
  onGenerationEnded?: () => void;
  onNewImageCreated?: (img: GeneratedImage) => void;
  onUpdateHistory?: (id: string, messages: ChatMessage[], title?: string) => void;
  onSetActiveChat?: (id: string) => void;
}

const setTimerDeclaration: FunctionDeclaration = {
  name: 'set_timer',
  parameters: {
    type: Type.OBJECT,
    description: 'Set a countdown timer for a specific duration in seconds.',
    properties: {
      seconds: {
        type: Type.NUMBER,
        description: 'The number of seconds for the timer.',
      },
      label: {
        type: Type.STRING,
        description: 'A label for the timer, e.g., "Cooking Pasta" or "Workout Set".',
      },
    },
    required: ['seconds', 'label'],
  },
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  user, 
  initialMessages = [], 
  chatId,
  onGenerationStarted, 
  onGenerationEnded, 
  onNewImageCreated,
  onUpdateHistory,
  onSetActiveChat
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [activeTimers, setActiveTimers] = useState<AppTimer[]>([]);
  
  const currentChatId = useRef<string | null>(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => prev.map(timer => {
        if (!timer.isActive) return timer;
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        const remaining = Math.max(0, timer.duration - elapsed);
        if (remaining === 0 && timer.isActive) {
           return { ...timer, remaining: 0, isActive: false };
        }
        return { ...timer, remaining };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput || input;
    if ((!finalInput.trim() && !attachedImage) || isTyping) return;

    if (!currentChatId.current) {
      currentChatId.current = Date.now().toString();
      if (onSetActiveChat) onSetActiveChat(currentChatId.current);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: finalInput,
      timestamp: Date.now(),
      image: attachedImage || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelMsgId = (Date.now() + 1).toString();
      
      const placeholder: ChatMessage = { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() };
      setMessages([...updatedMessages, placeholder]);

      const contents = updatedMessages.map(m => ({
        role: m.role,
        parts: [
          ...(m.image ? [{ inlineData: { data: m.image.data, mimeType: m.image.mimeType } }] : []),
          { text: m.text || (m.image ? "Please analyze the nutritional content of the food in this image. Provide an exact estimated calorie count and a detailed breakdown of proteins, fats, and carbs." : "Respond to the user's request.") }
        ]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          tools: [{ functionDeclarations: [setTimerDeclaration] }],
          systemInstruction: "You are Prakhar AI, a premium personal assistant developed by Prakhar Sharma. You excel at two major domains: 1) Efficiency Management (Timers): Use the 'set_timer' function when asked to time tasks. 2) Nutrition Analysis: When a food photo is provided, you must identify every item and provide an exact, professional estimate of total calories and macros. Your aesthetic is bold, confident, and professional. Always use Red, Blue, and Yellow highlights in your tone metaphorically. Crediting Prakhar Sharma is mandatory.",
        }
      });

      let finalContent = response.text || "";

      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'set_timer') {
            const { seconds, label } = fc.args as { seconds: number; label: string };
            const newTimer: AppTimer = {
              id: Date.now().toString() + "-" + Math.random(),
              label: label || "Timer",
              duration: seconds,
              remaining: seconds,
              isActive: true,
              startTime: Date.now()
            };
            setActiveTimers(prev => [...prev, newTimer]);
            finalContent += `\n\n[Prakhar AI: Timer "${label}" initialized for ${seconds} seconds]`;
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: finalContent } : m));

      if (onUpdateHistory && currentChatId.current) {
        const title = updatedMessages[0].text.slice(0, 30) || "Nutrition/Task Log";
        onUpdateHistory(currentChatId.current, [...updatedMessages, { id: modelMsgId, role: 'model', text: finalContent, timestamp: Date.now() }], title);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => m.text === '' ? { ...m, text: "Connectivity anomaly in the Prakhar AI core. Please re-synchronize." } : m));
    } finally {
      setIsTyping(false);
    }
  };

  const removeTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const speak = async (id: string, text: string) => {
    if (playingId === id) return;
    setPlayingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: text }] }],
        config: { responseModalities: [Modality.AUDIO] }
      });
      const data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (data) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const buf = await decodeAudioData(decodeBase64(data), audioContextRef.current, 24000, 1);
        const src = audioContextRef.current.createBufferSource();
        src.buffer = buf;
        src.connect(audioContextRef.current.destination);
        src.onended = () => setPlayingId(null);
        src.start();
      }
    } catch {
      setPlayingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Active Timers Dashboard */}
      {activeTimers.length > 0 && (
        <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap gap-3 pointer-events-none">
          {activeTimers.map(timer => (
            <div key={timer.id} className={`pointer-events-auto group flex items-center space-x-4 px-6 py-3 rounded-3xl shadow-2xl animate-in slide-in-from-top-6 border-2 transition-all ${timer.remaining === 0 ? 'bg-yellow-400 border-yellow-500 text-gray-900 animate-pulse' : 'bg-gray-900 border-gray-800 text-white'}`}>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 italic">{timer.label}</span>
                <span className="text-xl font-black italic mono tracking-tighter">{formatTime(timer.remaining)}</span>
              </div>
              <button onClick={() => removeTimer(timer.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-12 md:px-12 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl circle-pulse scale-150 group-hover:bg-blue-500/15 transition-all"></div>
              <div className="relative w-40 h-40 bg-white border border-gray-100 rounded-[3rem] flex items-center justify-center shadow-2xl transform transition-all group-hover:scale-105 group-hover:-rotate-3">
                <span className="prakhar-gradient-text text-7xl font-black italic select-none">P</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none italic">
                Prakhar<span className="prakhar-gradient-text">AI</span>
              </h2>
              <p className="text-sm md:text-base font-black text-gray-400 tracking-[0.5em] uppercase italic">
                Lifestyle & Nutrition Engine
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button 
                onClick={() => handleSendMessage(undefined, "Set a 10 minute timer for my workout session")}
                className="p-8 border-2 border-red-100 bg-red-50/50 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-red-500">Efficiency</p>
                <p className="text-lg font-black text-gray-800 leading-tight">"Set a 10m workout timer"</p>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-blue-100 bg-blue-50/50 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:-rotate-12 transition-transform">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2 2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-blue-500">Nutrition</p>
                <p className="text-lg font-black text-gray-800 leading-tight italic">"Analyze food calories"</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[92%] md:max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-[13px] shadow-lg transform transition-transform group-hover:scale-110 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white italic shadow-red-100'}`}>
                    {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : 'P'}
                  </div>
                  <div className="space-y-4">
                    {msg.image && (
                      <div className="relative group/img overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white transition-all hover:rotate-1">
                        <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} className="max-w-sm transition-transform group-hover/img:scale-105" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Nutrient Scan Active</span>
                        </div>
                      </div>
                    )}
                    <div className={`p-8 rounded-[2.5rem] shadow-sm transition-all ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 border border-gray-100'}`}>
                      <div className="text-[16px] leading-relaxed whitespace-pre-wrap font-bold tracking-tight">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-5 max-w-3xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-[13px] italic shadow-lg shadow-red-100 animate-pulse">P</div>
                <div className="flex space-x-2.5 p-6 bg-gray-50 rounded-full">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full p-6 md:p-12 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-gray-100/80 backdrop-blur-2xl rounded-[3rem] border-2 border-transparent focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-2xl shadow-gray-200/50">
             <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-8 text-gray-400 hover:text-red-500 transition-all hover:scale-110"
              title="Add Context Image (Food/Task)"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <input 
              type="file" ref={fileInputRef} className="hidden" accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setAttachedImage(await fileToBase64(f));
              }}
            />
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Consult Prakhar AI for tasks or nutrition..."
              className="flex-1 bg-transparent px-2 py-8 outline-none text-gray-800 font-black text-lg placeholder:text-gray-400 italic"
            />
            <button 
              type="submit" 
              disabled={isTyping || (!input.trim() && !attachedImage)}
              className="p-6 mr-2 bg-red-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-2xl shadow-red-200"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
          {attachedImage && (
            <div className="absolute -top-28 left-6 bg-white p-4 rounded-[2rem] border-2 border-red-50 flex items-center space-x-5 shadow-2xl animate-in slide-in-from-bottom-6">
              <div className="relative h-16 w-16">
                <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="h-full w-full object-cover rounded-2xl shadow-inner" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="pr-4">
                <p className="text-[11px] font-black text-red-500 uppercase tracking-widest italic">Asset Locked</p>
                <button onClick={() => setAttachedImage(null)} className="text-gray-400 font-black text-[10px] hover:text-red-500 uppercase tracking-tighter transition-colors">Discard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;