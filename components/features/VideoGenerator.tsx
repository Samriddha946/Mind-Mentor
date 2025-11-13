import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, generateVideoFromImage, checkVideoOperation } from '../../services/geminiService';
import { fileToBase64 } from '../../services/fileUtils';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

const loadingMessages = [
    "Warming up the digital canvas...",
    "Choreographing pixels into motion...",
    "Rendering your vision, frame by frame...",
    "This can take a few minutes, hang tight!",
    "Almost there, adding the final touches...",
];

export const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [image, setImage] = useState<{ file: File, base64: string, url: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingInterval = useRef<number | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);
    
    useEffect(() => {
        if (isLoading) {
            let messageIndex = 0;
            const interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleSelectApiKey = async () => {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race condition
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setImage({ file, base64, url: URL.createObjectURL(file) });
        }
    };

    const pollOperation = (operation: any) => {
        pollingInterval.current = window.setInterval(async () => {
            try {
                const updatedOperation = await checkVideoOperation(operation);
                if (updatedOperation.done) {
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    setIsLoading(false);
                    const videoUri = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (videoUri) {
                        setGeneratedVideoUrl(`${videoUri}&key=${process.env.API_KEY}`);
                    } else {
                        setError("Video generation complete, but no video URL was found.");
                    }
                }
            } catch (err: any) {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                setIsLoading(false);
                setError(`Error checking video status: ${err.message}`);
            }
        }, 10000);
    };

    const handleSubmit = async () => {
        if (!prompt && !image) {
            setError('Please enter a prompt or upload an image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            let operation;
            if (image) {
                operation = await generateVideoFromImage(prompt, { imageBytes: image.base64, mimeType: image.file.type }, aspectRatio);
            } else {
                operation = await generateVideoFromPrompt(prompt, aspectRatio);
            }
            pollOperation(operation);
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found")) {
                setError("API Key not found. Please select your API key again.");
                setApiKeySelected(false);
            } else {
                setError(`Failed to start video generation: ${err.message}`);
            }
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        return () => {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
    }, [])

    if (!apiKeySelected) {
        return (
            <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg text-center animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4">API Key Required for Veo</h2>
                <p className="mb-4 text-gray-200">Video generation with Veo requires a user-selected API key. Please select a key to continue.</p>
                <p className="mb-6 text-sm text-gray-400">For billing information, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
                <Button onClick={handleSelectApiKey}>Select API Key</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">AI Video Generator (Veo)</h2>
            <p className="text-gray-300 mb-6">Create videos from text or animate an image.</p>
            
            <div className="space-y-4">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A cat playing a tiny piano on a cloud..." className="w-full p-3 themed-input rounded-lg" rows={3} disabled={isLoading} />
                <div className="flex flex-wrap items-center gap-4">
                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary" disabled={isLoading}>Upload Image (Optional)</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="p-2 themed-input rounded-lg appearance-none" disabled={isLoading}>
                        <option className="bg-gray-800" value="16:9">Landscape (16:9)</option>
                        <option className="bg-gray-800" value="9:16">Portrait (9:16)</option>
                    </select>
                </div>
                {image && <p className="text-sm">Image selected: {image.file.name}</p>}
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>Generate Video</Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-6">
                {isLoading && <Spinner message={loadingMessage} />}
                {generatedVideoUrl && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-2">Your Video:</h3>
                        <video src={generatedVideoUrl} controls className="w-full rounded-lg shadow-md" />
                    </div>
                )}
            </div>
        </div>
    );
};