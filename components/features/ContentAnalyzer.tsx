import React, { useState, useRef } from 'react';
import { analyzeImage, analyzeVideo } from '../../services/geminiService';
import { fileToBase64 } from '../../services/fileUtils';
import { Button } from '../common/Button';

type MediaType = 'image' | 'video';

export const ContentAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [media, setMedia] = useState<{ file: File, type: MediaType, url: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            setMedia({ file, type, url: URL.createObjectURL(file) });
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!prompt || !media) {
            setError('Please upload content and provide a question.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Data = await fileToBase64(media.file);
            let analysisResult: string;
            if (media.type === 'image') {
                analysisResult = await analyzeImage(base64Data, media.file.type, prompt);
            } else {
                analysisResult = await analyzeVideo(base64Data, media.file.type, prompt);
            }
            setResult(analysisResult);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Content Analyzer</h2>
            <p className="text-gray-300 mb-6">Upload an image or video and ask questions to get AI-powered insights.</p>

            <div className="space-y-4">
                <div
                    className="w-full h-64 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-white/10 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {media ? (
                        media.type === 'image' ? (
                            <img src={media.url} alt="Uploaded content" className="max-w-full max-h-full rounded-md" />
                        ) : (
                            <video src={media.url} controls className="max-w-full max-h-full rounded-md" />
                        )
                    ) : (
                        <p className="text-gray-300">Click to upload an image or video</p>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
                />
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., What are the main objects in this image? or Summarize this video."
                    className="w-full p-3 themed-input rounded-lg"
                    rows={3}
                    disabled={isLoading || !media}
                />
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || !media || !prompt}>
                    Analyze Content
                </Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-6">
                {result && (
                    <div className="p-4 bg-black/30 rounded-lg animate-fade-in-up">
                        <h3 className="text-xl font-semibold">Analysis:</h3>
                        <p className="mt-2 prose prose-invert max-w-none text-gray-200">{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};