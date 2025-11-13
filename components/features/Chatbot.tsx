import React, { useState, useEffect, useRef, useContext } from 'react';
import { createChat, sendMessageToChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import { SendIcon } from '../Icons';
import { AppContext } from '../../contexts/AppContext';
import { recordActivity } from '../../services/statsService';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const context = useContext(AppContext);

    useEffect(() => {
        if (context) {
            const { language, tone, responseLength, activeAIModel } = context;
            chatRef.current = createChat(activeAIModel.id, activeAIModel.engine, language, tone, responseLength);
            setMessages([{ sender: 'ai', text: `Hello! I'm now running on ${activeAIModel.name}. How can I assist you today?` }]);
        }
    }, [context?.language, context?.tone, context?.responseLength, context?.activeAIModel]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !context) return;
        const { user, refreshStats } = context;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (chatRef.current) {
                const response = await sendMessageToChat(chatRef.current, input);
                const aiMessage: Message = { sender: 'ai', text: response.text };
                setMessages(prev => [...prev, aiMessage]);

                if (user) {
                    recordActivity('chat');
                    refreshStats();
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const bubbleStyle = context ? `ai-bubble-${context.activeAIModel.id}` : '';

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto glass-card rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0 shadow-lg"></div>}
                        <div className={`max-w-xl p-4 rounded-2xl transition-all duration-300 ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : `bg-gray-900/70 text-gray-200 rounded-bl-none ${bubbleStyle}`}`}>
                           <p className={`text-lg leading-relaxed ${msg.sender === 'ai' ? 'text-glow' : ''}`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0 shadow-lg"></div>
                        <div className={`max-w-md p-4 rounded-2xl bg-gray-900/70 ${bubbleStyle}`}>
                            <div className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="w-full pl-5 pr-16 py-4 themed-input rounded-full"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full hover:scale-110 disabled:opacity-50 transition-transform">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};