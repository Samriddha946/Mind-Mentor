import React from 'react';

interface AIAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ isListening, isSpeaking, isUserSpeaking }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Listening Glow Effect */}
      <div className={`absolute inset-0 rounded-full bg-[var(--secondary)]/10 transition-all duration-500 ease-in-out ${isListening ? 'animate-pulse scale-100' : 'scale-0'}`} style={{ animationDuration: '2.5s' }} />
      
       {/* User Speaking Indicator */}
      <div className={`absolute inset-0 rounded-full border-2 border-[var(--primary)]/80 transition-all duration-300 ease-in-out ${isUserSpeaking ? 'opacity-100 scale-110 animate-pulse' : 'opacity-0 scale-100'}`} style={{ animationDuration: '1.5s' }} />
      
       {/* AI Speaking Indicator */}
      <div className={`absolute inset-2 rounded-full border-2 border-[var(--secondary)]/50 transition-all duration-500 ease-in-out ${isSpeaking ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-95'}`} style={{ animationDuration: '1s', animationDelay: '0.2s' }} />


      {/* Main Avatar Body */}
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/10 shadow-2xl overflow-hidden">
        {/* Core Glow */}
        <div className={`absolute inset-0 rounded-full bg-[var(--primary)]/30 blur-xl transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-60'}`} />

        {/* Eye */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black/50" />
        </div>

        {/* Mouth */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-3 bg-cyan-300/80 rounded-full transition-transform duration-200" style={{ transform: `translateX(-50%) scaleY(${isSpeaking ? 1 : 0.2})` }}>
            <div className={`w-full h-full rounded-full transition-transform duration-100 ${isSpeaking ? 'animate-speak' : ''}`} />
        </div>
      </div>
    </div>
  );
};