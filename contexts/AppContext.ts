import React, { createContext, Dispatch, SetStateAction } from 'react';

export type Theme = 'light' | 'dark';

export interface Mood {
  name: string;
  emoji: string;
  theme: {
    bgStart: string;
    bgEnd: string;
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    font: string;
  };
  animation: {
    type: 'aurora' | 'ripples' | 'streaks' | 'sparkles' | 'clouds';
  };
}


export interface User {
    name: string;
    email: string;
    photoURL: string;
}

export interface UserStats {
    points: number;
    level: number;
    tasksCompleted: number;
    chatMessages: number;
    contentGenerated: number;
    currentStreak: number;
    lastActivityDate: string | null;
    badges: string[];
    mindCoins: number;
    gamesPlayed: number;
}

export interface AIModel {
  id: 'chat-gpt-5' | 'perplexity-ai' | 'gemini-deepmind' | 'mind-mentor';
  name: string;
  engine: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  description: string;
  iconName: 'openai' | 'perplexity' | 'gemini' | 'brain';
  theme: {
    primary: string;
    secondary: string;
  };
}

export interface AppContextType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  mood: Mood;
  setMood: Dispatch<SetStateAction<Mood>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  tone: string;
  setTone: Dispatch<SetStateAction<string>>;
  responseLength: string;
  setResponseLength: Dispatch<SetStateAction<string>>;
  user: User | null;
  login: () => void;
  logout: () => void;
  stats: UserStats | null;
  refreshStats: () => void;
  activeAIModel: AIModel;
  setActiveAIModel: Dispatch<SetStateAction<AIModel>>;
  isReducedMotion: boolean;
  setIsReducedMotion: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const moodThemes: Record<string, Mood> = {
  'focused': {
    name: 'Focused Flow',
    emoji: '🌊',
    theme: {
      bgStart: '#0B132B', bgEnd: '#1C2541',
      primary: '#00FFFF', secondary: '#4DFFFF',
      accent: '#7D5FFF', glow: 'rgba(0, 255, 255, 0.7)',
      font: 'Montserrat'
    },
    animation: { type: 'streaks' }
  },
  'calm': {
    name: 'Midnight Calm',
    emoji: '🌌',
    theme: {
      bgStart: '#2E1A47', bgEnd: '#3A3064',
      primary: '#A7C7E7', secondary: '#E6E6FA',
      accent: '#B1A2E8', glow: 'rgba(167, 199, 231, 0.6)',
      font: 'Inter'
    },
    animation: { type: 'ripples' }
  },
  'happy': {
    name: 'Coral Sunrise',
    emoji: '🌅',
    theme: {
      bgStart: '#FF7E5F', bgEnd: '#FEB47B',
      primary: '#FFD700', secondary: '#FF69B4',
      accent: '#FFA500', glow: 'rgba(255, 215, 0, 0.8)',
      font: 'Poppins'
    },
    animation: { type: 'sparkles' }
  },
  'excited': {
    name: 'Aurora Pulse',
    emoji: '💫',
    theme: {
      bgStart: '#1D0E2D', bgEnd: '#4D1B5D',
      primary: '#F472B6', secondary: '#34D399',
      accent: '#A78BFA', glow: 'rgba(52, 211, 153, 0.7)',
      font: 'Sora'
    },
    animation: { type: 'aurora' }
  },
  'stressed': {
    name: 'Cloud Drift',
    emoji: '☁️',
    theme: {
      bgStart: '#606F80', bgEnd: '#8CA5BE',
      primary: '#B0C4DE', secondary: '#FFFFFF',
      accent: '#9FBBD7', glow: 'rgba(176, 196, 222, 0.6)',
      font: 'Nunito Sans'
    },
    animation: { type: 'clouds' }
  },
  'sleepy': {
    name: 'Twilight Bloom',
    emoji: '🌸',
    theme: {
      bgStart: '#2C3E50', bgEnd: '#4A5568',
      primary: '#E6BF83', secondary: '#D8BFD8',
      accent: '#C3A1F4', glow: 'rgba(230, 191, 131, 0.6)',
      font: 'Cormorant Garamond'
    },
    animation: { type: 'ripples' }
  },
};

export const aiModels: Record<string, AIModel> = {
  'chat-gpt-5': {
    id: 'chat-gpt-5',
    name: 'ChatGPT-5',
    engine: 'gemini-2.5-pro',
    description: 'Empathetic, deep, and adaptive for creative reasoning.',
    iconName: 'openai',
    theme: { primary: '#10a37f', secondary: '#74aa9c' },
  },
  'perplexity-ai': {
    id: 'perplexity-ai',
    name: 'Perplexity AI',
    engine: 'gemini-2.5-flash',
    description: 'Precise, concise, and web-connected for research.',
    iconName: 'perplexity',
    theme: { primary: '#00aaff', secondary: '#57c7ff' },
  },
  'gemini-deepmind': {
    id: 'gemini-deepmind',
    name: 'Gemini',
    engine: 'gemini-2.5-pro',
    description: 'Expressive and multimodal for visual reasoning.',
    iconName: 'gemini',
    theme: { primary: '#F4B400', secondary: '#EA4335' },
  },
  'mind-mentor': {
    id: 'mind-mentor',
    name: 'MindMentor',
    engine: 'gemini-2.5-pro',
    description: 'Our custom core: Emotionally intelligent and focused on personal growth.',
    iconName: 'brain',
    theme: { primary: '#7D5FFF', secondary: '#4FD1C5' },
  },
};

export const languages = [
    { value: 'English', label: 'English 🇬🇧' },
    { value: 'Hinglish', label: 'Hinglish 🪷' },
    { value: 'Hindi', label: 'Hindi 🇮🇳' },
    { value: 'Spanish', label: 'Spanish 🇪🇸' },
    { value: 'Sanskrit', label: 'Sanskrit 🕉️' },
    { value: 'French', label: 'French 🇫🇷' },
    { value: 'Japanese', label: 'Japanese 🇯🇵' },
    { value: 'Arabic', label: 'Arabic 🇸🇦' },
    { value: 'German', label: 'German 🇩🇪' },
    { value: 'Russian', label: 'Russian 🇷🇺' },
    { value: 'Korean', label: 'Korean 🇰🇷' },
    { value: 'Italian', label: 'Italian 🇮🇹' },
    { value: 'Portuguese', label: 'Portuguese 🇵🇹' },
    { value: 'Tamil', label: 'Tamil 🇮🇳' },
    { value: 'Marathi', label: 'Marathi 🇮🇳' },
];

export const tones = [
    { value: 'Academic', label: '🎓 Academic' },
    { value: 'Creative', label: '💡 Creative' },
    { value: 'Casual', label: '💬 Casual' },
    { value: 'Empathetic', label: '❤️ Empathetic' },
    { value: 'Calm', label: '🧘 Calm' },
    { value: 'Direct', label: '⚙️ Direct' },
    { value: 'Spiritual', label: '🕊️ Spiritual' },
    { value: 'Technical', label: '🤖 Technical' },
];

export const responseLengths = [
    { value: 'Mini', label: 'Mini (1-2 sentences)'},
    { value: 'Standard', label: 'Standard (3-5 sentences)'},
    { value: 'Deep Dive', label: 'Deep Dive (6+ sentences)'},
];