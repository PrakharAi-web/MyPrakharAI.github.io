
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ChatMessage, GeneratedImage } from '../types.ts';
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
  
  const currentChatId = useRef<string | null>(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      const newMessagesWithPlaceholder = [...updatedMessages, placeholder];
      setMessages(newMessagesWithPlaceholder);

      const contents = updatedMessages.map(m => ({
        role: m.role,
        parts: [
          ...(m.image ? [{ inlineData: { data: m.image.data, mimeType: m.image.mimeType } }] : []),
          { text: m.text || "Analyze this." }
        ]
      }));

      const stream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: "You are Prakhar AI. Created by Prakhar Sharma. Use a tone that is premium, intelligent, and helpful. Use White, Red, Blue, and Yellow imagery in your descriptions. Keep output clean and professional.",
        }
      });

      let fullText = '';
      for await (const chunk of stream) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          fullText += text;
          setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m));
        }
      }

      if (onUpdateHistory && currentChatId.current) {
        const title = updatedMessages[0].text.slice(0, 30) + (updatedMessages[0].text.length > 30 ? "..." : "");
        const finalModelMsg: ChatMessage = { id: modelMsgId, role: 'model', text: fullText, timestamp: Date.now() };
        onUpdateHistory(currentChatId.current, [...updatedMessages, finalModelMsg], title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
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

  const suggestions = [
    { title: "Creativity", text: "Generate a concept for a futuristic Red and Blue skyscraper" },
    { title: "Analysis", text: "Explain the psychological impact of Yellow in industrial design" },
    { title: "Strategy", text: "Plan a marketing campaign for a premium AI tool" },
    { title: "Dream", text: "Describe a world where architecture is made of pure light" }
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl circle-pulse scale-150 group-hover:bg-red-500/15 transition-all"></div>
              <div className="relative w-32 h-32 bg-white border-2 border-gray-100 rounded-[2.5rem] flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105">
                <span className="prakhar-gradient-text text-6xl font-black italic select-none">P</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-tight">
                Prakhar<span className="prakhar-gradient-text">AI</span>
              </h2>
              <p className="text-lg md:text-xl font-bold text-gray-400 tracking-wide uppercase">
                Intelligence Defined. Design Refined.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(undefined, s.text)}
                  className="p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-blue-500/20 rounded-3xl text-left transition-all group shadow-sm hover:shadow-xl"
                >
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{s.title}</p>
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 leading-snug">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[90%] md:max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-[11px] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-100 text-red-500'}`}>
                    {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : 'P'}
                  </div>
                  <div className="space-y-4">
                    {msg.image && (
                      <div className="relative group/img overflow-hidden rounded-3xl shadow-2xl border-2 border-white">
                        <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} className="max-w-xs transition-transform group-hover/img:scale-105" />
                      </div>
                    )}
                    <div className={`p-5 rounded-[2rem] shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-800'}`}>
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                        {msg.text}
                      </div>
                    </div>
                    {msg.role === 'model' && msg.text && (
                      <div className="flex items-center space-x-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => speak(msg.id, msg.text)}
                          className={`p-2 rounded-xl hover:bg-gray-100 transition-all ${playingId === msg.id ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-4 max-w-3xl mx-auto">
                <div className="w-9 h-9 rounded-2xl border-2 border-gray-100 text-red-500 flex items-center justify-center font-black text-[11px]">P</div>
                <div className="flex space-x-1.5 p-4 bg-gray-50 rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full p-4 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-gray-100/80 backdrop-blur-md rounded-[2.5rem] border-2 border-transparent focus-within:border-blue-500/20 focus-within:bg-white transition-all shadow-sm">
             <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 text-gray-400 hover:text-blue-500 transition-colors"
              title="Upload Image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
              placeholder="Query Prakhar AI..."
              className="flex-1 bg-transparent px-2 py-6 outline-none text-gray-800 font-bold text-[15px] placeholder:text-gray-400 placeholder:font-semibold"
            />
            <button 
              type="submit" 
              disabled={isTyping || (!input.trim() && !attachedImage)}
              className="p-5 mr-1 text-blue-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-20"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
          {attachedImage && (
            <div className="absolute -top-24 left-4 bg-white p-2.5 rounded-3xl border-2 border-blue-100 flex items-center space-x-3 shadow-2xl animate-in slide-in-from-bottom-4">
              <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="h-16 w-16 object-cover rounded-2xl" />
              <div className="pr-4">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Image Loaded</p>
                <button onClick={() => setAttachedImage(null)} className="text-red-500 font-black text-[10px] hover:underline uppercase tracking-tighter">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
