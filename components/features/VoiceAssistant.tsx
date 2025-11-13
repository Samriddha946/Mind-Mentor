import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { connectLiveSession } from '../../services/geminiService';
import type { LiveServerMessage, Blob } from '@google/genai';
import { decodeBase64, encodeBase64, pcmToAudioBuffer } from '../../services/audioUtils';
import { Button } from '../common/Button';
import { MicIcon, StopIcon, ChevronDownIcon } from '../Icons';
import { AIAvatar } from './AIAvatar';
import { AppContext } from '../../contexts/AppContext';

const createPcmBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
    }
    return {
        data: encodeBase64(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};

const personalities = [
    { id: 'Chill Friend', label: '😎 Chill Friend' },
    { id: 'Supportive Listener', label: '🧘 Supportive Listener' },
    { id: 'Study Partner', label: '🎓 Study Partner' },
    { id: 'Idea Brainstormer', label: '💡 Idea Brainstormer' },
];

const voices = [
    { id: 'Zephyr', label: 'Friendly & Cheerful' },
    { id: 'Puck', label: 'Soft & Calm' },
    { id: 'Fenrir', label: 'Energetic & Motivational' },
    { id: 'Kore', label: 'Gentle & Mindful' },
];

const CustomSelect: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {id: string; label: string}[], disabled: boolean }> = ({ value, onChange, options, disabled }) => (
    <div className="relative">
        <select value={value} onChange={onChange} disabled={disabled} className="bg-white/10 text-sm focus:outline-none appearance-none px-4 py-2 pr-8 rounded-md cursor-pointer disabled:opacity-50">
            {options.map(opt => <option key={opt.id} value={opt.id} className="bg-gray-800 text-base">{opt.label}</option>)}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
    </div>
);

export const MindBuddy: React.FC = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [status, setStatus] = useState('Ready to Chat');
    const [userTranscript, setUserTranscript] = useState('');
    const [aiTranscript, setAiTranscript] = useState('');
    const [transcriptHistory, setTranscriptHistory] = useState<{user: string, ai: string}[]>([]);
    const [personality, setPersonality] = useState(personalities[0].id);
    const [voice, setVoice] = useState(voices[0].id);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const userSpeakingTimeoutRef = useRef<number | null>(null);
    const currentUserTranscriptRef = useRef('');
    const currentAiTranscriptRef = useRef('');


    const nextStartTimeRef = useRef(0);
    const outputSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    const context = useContext(AppContext);

    const stopSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(sourceNodeRef.current){
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputSources.current.forEach(source => source.stop());
            outputSources.current.clear();
            await outputAudioContextRef.current.close();
        }
        if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
        
        setIsSessionActive(false);
        setIsSpeaking(false);
        setIsUserSpeaking(false);
        setStatus('Ready to Chat');
        sessionPromiseRef.current = null;
    }, []);

    const startSession = async () => {
        if (isSessionActive) return;
        setStatus('Initializing...');
        setTranscriptHistory([]);
        setUserTranscript('');
        setAiTranscript('');
        currentUserTranscriptRef.current = '';
        currentAiTranscriptRef.current = '';

        if (!context) {
            setStatus('Error: App context not available.');
            return;
        }
        const { language, tone, responseLength, user, mood } = context;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            sessionPromiseRef.current = connectLiveSession({
                onopen: () => {
                    setIsSessionActive(true);
                    setStatus('Listening...');
                    sourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    sourceNodeRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentUserTranscriptRef.current += message.serverContent.inputTranscription.text;
                        setUserTranscript(currentUserTranscriptRef.current);
                        setIsUserSpeaking(true);
                        if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
                        userSpeakingTimeoutRef.current = window.setTimeout(() => setIsUserSpeaking(false), 500);
                    }

                    if (message.serverContent?.outputTranscription) {
                        currentAiTranscriptRef.current += message.serverContent.outputTranscription.text;
                        setAiTranscript(currentAiTranscriptRef.current);
                    }
                    
                    if (message.serverContent?.turnComplete) {
                        setTranscriptHistory(prev => [...prev, { user: currentUserTranscriptRef.current, ai: currentAiTranscriptRef.current }]);
                        currentUserTranscriptRef.current = '';
                        currentAiTranscriptRef.current = '';
                        setUserTranscript('');
                        setAiTranscript('');
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData && outputAudioContextRef.current) {
                        setIsSpeaking(true);
                        const audioBuffer = await pcmToAudioBuffer(decodeBase64(audioData), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        
                        const currentTime = outputAudioContextRef.current.currentTime;
                        const startTime = Math.max(currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        outputSources.current.add(source);
                        source.onended = () => {
                            outputSources.current.delete(source);
                            if (outputSources.current.size === 0) setIsSpeaking(false);
                        };
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Session error:", e);
                    setStatus(`Error: ${e.message}`);
                    stopSession();
                },
                onclose: () => {
                    setStatus('Session closed.');
                    stopSession();
                },
            }, language, tone, responseLength, user?.name || null, mood.name, personality, voice);

        } catch (error) {
            console.error("Failed to start session:", error);
            setStatus(`Error: Could not get microphone access.`);
        }
    };
    
    useEffect(() => {
        return () => {
            if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
            stopSession();
        };
    }, [stopSession]);

    return (
        <div className="max-w-4xl mx-auto p-8 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="font-orbitron text-4xl font-bold mb-2 text-center text-gradient-animated">MindBuddy™</h2>
            <p className="text-lg text-gray-300 mb-6 text-center">Your AI friend, ready to talk.</p>

            <div className="p-4 bg-black/20 rounded-lg mb-6 flex flex-wrap justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm">Persona:</label>
                    <CustomSelect value={personality} onChange={e => setPersonality(e.target.value)} options={personalities} disabled={isSessionActive} />
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm">Voice:</label>
                    <CustomSelect value={voice} onChange={e => setVoice(e.target.value)} options={voices} disabled={isSessionActive} />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                <AIAvatar isListening={isSessionActive} isSpeaking={isSpeaking} isUserSpeaking={isUserSpeaking} />
                <div className="text-xl font-semibold text-center h-8">
                    <p className={`transition-colors ${isSessionActive ? 'text-cyan-400' : ''}`}>{status}</p>
                </div>
                 {!isSessionActive ? (
                    <Button onClick={startSession} className="w-48"><MicIcon className="mr-2"/> Start Chat</Button>
                ) : (
                    <Button onClick={stopSession} variant="secondary" className="w-48 bg-red-500/80 hover:bg-red-500/90 text-white"><StopIcon className="mr-2"/> End Chat</Button>
                )}
            </div>

            <div className="space-y-4 p-6 bg-black/30 rounded-lg min-h-[300px]">
                <h3 className="text-2xl font-satoshi font-semibold border-b pb-3 border-white/10">Conversation</h3>
                <div className="space-y-4 text-lg max-h-64 overflow-y-auto">
                    {transcriptHistory.map((turn, i) => (
                        <div key={i} className="leading-relaxed animate-fade-in-up">
                           <p><strong className="text-cyan-400 font-semibold">You:</strong> {turn.user}</p>
                           <p><strong className="text-violet-400 font-semibold">Buddy:</strong> {turn.ai}</p>
                        </div>
                    ))}
                     <div className="leading-relaxed">
                        {userTranscript && <p><strong className="text-cyan-400 font-semibold">You:</strong> {userTranscript}</p>}
                        {aiTranscript && <p><strong className="text-violet-400 font-semibold">Buddy:</strong> {aiTranscript}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};