
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'generation' | 'edit';
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  prompt: string;
  base64Image?: string;
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface AppTimer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  isActive: boolean;
  startTime: number;
}
