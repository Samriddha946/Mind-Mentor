import React, { useState, useRef, useContext, useEffect } from 'react';
import { generateSpeech } from '../../services/geminiService';
import { Button } from '../common/Button';
import { AppContext } from '../../contexts/AppContext';
import { recordActivity } from '../../services/statsService';
import { decodeBase64, pcmToAudioBuffer } from '../../services/audioUtils';
import { VolumeUpIcon } from '../Icons';

export const SpeechGenerator: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioData, setAudioData] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const context = useContext(AppContext);

    useEffect(() => {
        // Initialize AudioContext on user interaction if not already done
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            window.removeEventListener('click', initAudioContext);
        };
        window.addEventListener('click', initAudioContext);

        return () => {
            window.removeEventListener('click', initAudioContext);
            audioContextRef.current?.close();
        };
    }, []);

    const playAudio = async (base64Data: string) => {
        const ctx = audioContextRef.current;
        if (!ctx) {
            setError("Audio context is not available.");
            return;
        }

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const decodedData = decodeBase64(base64Data);
        const audioBuffer = await pcmToAudioBuffer(decodedData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
    };


    const handleSubmit = async () => {
        if (!text) {
            setError('Please enter some text to generate speech.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAudioData(null);

        try {
            const audioDataB64 = await generateSpeech(text);
            if (audioDataB64) {
                setAudioData(audioDataB64);
                playAudio(audioDataB64);
                if (context?.user) {
                    recordActivity('speech');
                    context.refreshStats();
                }
            } else {
                throw new Error("No audio data received.");
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate speech. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Speech Generator (TTS)</h2>
            <p className="text-gray-300 mb-6">Convert text into natural-sounding speech.</p>
            
            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text here..."
                    className="w-full p-3 themed-input rounded-lg"
                    rows={5}
                    disabled={isLoading}
                />
                <div className="flex gap-4 items-center">
                    <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                        Generate Speech
                    </Button>
                    {audioData && !isLoading && (
                         <Button onClick={() => playAudio(audioData)} variant="secondary" className="animate-fade-in-up">
                            <VolumeUpIcon className="w-5 h-5 mr-2" />
                            Play Again
                        </Button>
                    )}
                </div>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
    );
};