
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

    // Create session ID if it doesn't exist
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
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelMsgId = (Date.now() + 1).toString();
      
      // Fix: Explicitly type the placeholder object to satisfy ChatMessage interface (role: 'user' | 'model')
      const placeholder: ChatMessage = { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() };
      const newMessagesWithPlaceholder = [...updatedMessages, placeholder];
      setMessages(newMessagesWithPlaceholder);

      const contents = updatedMessages.map(m => ({
        role: m.role,
        parts: [
          ...(m.image ? [{ inlineData: { data: m.image.data, mimeType: m.image.mimeType } }] : []),
          { text: m.text || "Explain this image." }
        ]
      }));

      const stream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: "You are Prakhar AI. Created by Prakhar Sharma. Provide extremely clean, professional text. DO NOT use hashtags (#), excessive stars (***), or markdown headers. Use bolding with double asterisks (**) only for key terms. Keep paragraphs concise. You are helpful, orange-themed, and premium.",
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

      // Update history in App
      if (onUpdateHistory && currentChatId.current) {
        const title = updatedMessages[0].text.slice(0, 30) + (updatedMessages[0].text.length > 30 ? "..." : "");
        // Fix: Explicitly type the final model response to avoid role inference error
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
      // Use process.env.API_KEY directly as per guidelines
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
    { title: "Creativity", text: "Design a futuristic workspace for a creative engineer" },
    { title: "Analysis", text: "Help me analyze a complex engineering problem" },
    { title: "Planning", text: "Plan a productive week for a senior developer" },
    { title: "Imagine", text: "Describe a smart home controlled entirely by AI" }
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#FF6B00]/15 rounded-full blur-3xl circle-pulse scale-150 group-hover:bg-[#FF6B00]/25 transition-all"></div>
              <div className="relative w-28 h-28 bg-gradient-to-tr from-[#FF6B00] via-[#FFB800] to-[#FF6B00] rounded-full flex items-center justify-center shadow-2xl shadow-orange-100 transform transition-transform group-hover:scale-110">
                <span className="text-white text-5xl font-black italic select-none">P</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-tight">
                Hello, <span className="gemini-gradient-text">{user ? user.name.split(' ')[0] : 'there'}</span>
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-gray-200 tracking-tight">
                How can I assist your vision today?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(undefined, s.text)}
                  className="p-6 bg-[#f8fafc] hover:bg-white rounded-[2.5rem] text-left transition-all group border border-transparent hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50/50"
                >
                  <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest mb-3 opacity-60 group-hover:opacity-100">{s.title}</p>
                  <p className="text-xs font-bold text-gray-500 group-hover:text-gray-800 line-clamp-3 leading-relaxed">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[90%] md:max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] ${msg.role === 'user' ? 'bg-[#FF6B00] text-white shadow-md' : 'bg-white border border-gray-100 text-[#FF6B00] shadow-sm'}`}>
                    {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : 'P'}
                  </div>
                  <div className="space-y-4">
                    {msg.image && (
                      <div className="relative group/img overflow-hidden rounded-2xl shadow-xl">
                        <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} className="w-64 border border-gray-100 transition-transform group-hover/img:scale-105" />
                      </div>
                    )}
                    <div className="clean-content prose prose-orange max-w-none">
                      <div className={`text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap font-medium tracking-tight`}>
                        {msg.text || (msg.image && !msg.text && msg.role === 'user' ? "Image analysis request" : "")}
                      </div>
                    </div>
                    {msg.role === 'model' && msg.text && (
                      <div className="flex items-center space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => speak(msg.id, msg.text)}
                          title="Listen"
                          className={`p-2 rounded-xl hover:bg-gray-100 transition-all ${playingId === msg.id ? 'text-[#FF6B00] bg-orange-50 animate-pulse' : 'text-gray-400'}`}
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
                <div className="w-8 h-8 rounded-full border border-gray-100 text-[#FF6B00] flex items-center justify-center font-bold text-[10px]">P</div>
                <div className="flex space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce duration-700"></div>
                  <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce duration-700 delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce duration-700 delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full p-4 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#f0f4f8] rounded-[2rem] shadow-sm hover:shadow-md border border-transparent focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50 transition-all">
             <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 text-gray-400 hover:text-[#FF6B00] transition-colors"
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
              placeholder="Message Prakhar AI..."
              className="flex-1 bg-transparent px-4 py-5 outline-none text-gray-800 font-semibold text-sm placeholder:text-gray-400"
            />
            <button 
              type="submit" 
              disabled={isTyping || (!input.trim() && !attachedImage)}
              className="p-4 mr-1 text-[#FF6B00] hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
          {attachedImage && (
            <div className="absolute -top-20 left-4 bg-white p-2 rounded-2xl border border-orange-100 flex items-center space-x-3 animate-in slide-in-from-bottom-2 shadow-2xl">
              <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="h-12 w-12 object-cover rounded-xl" />
              <div className="pr-2">
                <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Image Attached</p>
                <button onClick={() => setAttachedImage(null)} className="text-gray-400 font-bold text-[10px] hover:text-red-500 uppercase">Remove</button>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-3">
             <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-30 select-none">Accuracy Verified by Prakhar AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
