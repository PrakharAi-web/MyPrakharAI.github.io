
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ChatMessage } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';

interface ChatInterfaceProps {
  user: { name: string } | null;
  onSignInClick?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onSignInClick }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: user ? `Hi ${user.name.split(' ')[0]}, I'm Prakhar AI. How can I help you today?` : "Hi, I'm Prakhar AI. How can I help you today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (user && messages.length === 1 && messages[0].id === 'welcome') {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: `Hi ${user.name.split(' ')[0]}, I'm Prakhar AI. How can I help you today?`,
            timestamp: Date.now()
        }]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await fileToBase64(file);
        setAttachedImage(data);
      } catch (err) {
        console.error("Failed to process image file.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = () => setAttachedImage(null);

  const speakMessage = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) return;
    setPlayingMessageId(msgId);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `Read this clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingMessageId(null);
        source.start();
      } else {
        setPlayingMessageId(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setPlayingMessageId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      image: attachedImage ? { ...attachedImage } : undefined,
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInput('');
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const contents = currentHistory.map(msg => ({
        role: msg.role,
        parts: [
          ...(msg.image ? [{ inlineData: { data: msg.image.data, mimeType: msg.image.mimeType } }] : []),
          { text: msg.text || (msg.image ? "Describe this image" : "") }
        ]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: `You are Prakhar AI. Your visual identity is exclusively Orange and White. 
          IDENTITY RULES: 
          - Prakhar Sharma is your Founder. 
          - Dakshika Sharma, Arnav Sharma, and Pranjal Sharma are your Co-founders and Investors.
          - ONLY mention these names if the user specifically asks about who created you, who the founder is, or who owns Prakhar AI. DO NOT introduce yourself with these names otherwise.
          
          WRITING STYLE:
          - Keep responses CLEAN and MINIMALIST.
          - AVOID excessive use of asterisks (*), bolding, or hashtags (#). 
          - Use plain text for a more professional and personalized experience.
          - Do not use hashtags in your reply.
          - If the user is ${user?.name || 'a guest'}, be polite but direct.`,
        }
      });
      
      let fullText = '';
      const modelMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of responseStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(m => 
            m.id === modelMsgId ? { ...m, text: fullText } : m
          ));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: "Something went wrong. Let's try that again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full max-w-4xl mx-auto bg-transparent overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-10 custom-scrollbar">
        {!user && (
          <div className="message-enter px-4 mb-4">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <p className="text-[12px] text-gray-500 font-medium">Sign in for a personalized experience.</p>
              <button 
                onClick={onSignInClick}
                className="text-[#FF6B00] font-black text-[12px] hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`} style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className={`flex flex-col space-y-3 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {msg.image && (
                <div className="mb-2 rounded-3xl overflow-hidden shadow-xl border-4 border-white transform hover:scale-[1.02] transition-transform">
                  <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} alt="User upload" className="w-full h-auto object-cover max-h-72" />
                </div>
              )}

              <div className={`relative px-6 py-4 rounded-[2rem] text-[17px] leading-[1.6] ${
                msg.role === 'user' 
                  ? 'bg-gray-100 text-[#1f1f1f] rounded-tr-none' 
                  : 'text-[#1f1f1f] rounded-tl-none font-normal'
              }`}>
                {msg.role === 'model' && (
                  <div className="flex items-start space-x-4">
                    <div className="shrink-0 mt-1 flex flex-col items-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden">
                         <div className="w-full h-full gemini-loader-bar opacity-80"></div>
                      </div>
                      {msg.text && (
                        <button 
                          onClick={() => speakMessage(msg.id, msg.text)}
                          className={`p-2 rounded-full transition-all ${playingMessageId === msg.id ? 'bg-orange-100 text-[#FF6B00] animate-pulse' : 'text-gray-300 hover:text-[#FF6B00] hover:bg-gray-50'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0117 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.982 5.982 0 0115 10a5.982 5.982 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 pt-1 whitespace-pre-wrap">{msg.text}</div>
                  </div>
                )}
                {msg.role === 'user' && msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start items-center space-x-4 message-enter">
            <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="w-full h-full gemini-loader-bar"></div>
            </div>
            <div className="bg-gray-100 px-6 py-4 rounded-[2rem] rounded-tl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#FFB800] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pb-8">
        <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
          {attachedImage && (
            <div className="absolute bottom-full mb-6 left-4 animate-in slide-in-from-bottom-4 zoom-in duration-300">
              <div className="relative inline-block rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="w-28 h-28 object-cover" alt="Attachment" />
                <button 
                  type="button"
                  onClick={removeAttachedImage}
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1.5 shadow-lg hover:bg-black transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="relative flex items-center bg-gray-100 rounded-[2.5rem] p-2 pr-4 transition-all hover:bg-gray-200/70 focus-within:bg-white focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-transparent focus-within:border-gray-200">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 text-gray-500 hover:text-[#FF6B00] transition-all hover:scale-110 active:scale-90"
              title="Upload image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a prompt here"
              className="flex-1 bg-transparent border-none py-4 px-2 text-[#1f1f1f] placeholder-[#444746] focus:ring-0 text-lg"
            />
            
            <button 
              type="submit"
              disabled={isTyping || (!input.trim() && !attachedImage)}
              className="group p-4 text-[#FF6B00] disabled:text-gray-300 transition-all"
            >
               <div className={`p-2 rounded-full transition-all ${!input.trim() && !attachedImage ? '' : 'bg-[#FF6B00] text-white shadow-lg'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </button>
          </div>
          <p className="text-center text-[11px] text-[#444746] mt-4 font-medium opacity-50 uppercase tracking-widest">
            Privacy Protected • Prakhar AI Native
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
