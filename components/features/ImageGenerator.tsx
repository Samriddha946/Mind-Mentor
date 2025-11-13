import React, { useState, useContext } from 'react';
import { generateImage } from '../../services/geminiService';
import { Button } from '../common/Button';
import { AppContext } from '../../contexts/AppContext';
import { recordActivity } from '../../services/statsService';

export const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const context = useContext(AppContext);

    const handleSubmit = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        if (!context) return;
        const { user, refreshStats } = context;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageBytes = await generateImage(prompt, aspectRatio);
            setGeneratedImage(`data:image/jpeg;base64,${imageBytes}`);
            if (user) {
                recordActivity('image');
                refreshStats();
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4 text-white">Image Generator</h2>
            <p className="text-gray-300 mb-6">Describe the image you want to create. Be as detailed as you can!</p>
            
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A vibrant, futuristic city skyline at sunset, with flying cars and neon lights"
                    className="w-full p-3 themed-input rounded-lg"
                    rows={4}
                    disabled={isLoading}
                />
                <div className="flex items-center space-x-4">
                    <label htmlFor="aspect-ratio" className="font-medium">Aspect Ratio:</label>
                    <select
                        id="aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="p-2 themed-input rounded-lg appearance-none"
                        disabled={isLoading}
                    >
                        <option className="bg-gray-800" value="1:1">Square (1:1)</option>
                        <option className="bg-gray-800" value="16:9">Widescreen (16:9)</option>
                        <option className="bg-gray-800" value="9:16">Portrait (9:16)</option>
                        <option className="bg-gray-800" value="4:3">Landscape (4:3)</option>
                        <option className="bg-gray-800" value="3:4">Tall (3:4)</option>
                    </select>
                </div>
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                    Generate Image
                </Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-6">
                {isLoading && (
                     <div className="w-full aspect-square bg-black/30 rounded-lg flex items-center justify-center animate-pulse">
                        <p className="text-gray-400">Generating your masterpiece...</p>
                    </div>
                )}
                {generatedImage && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-2">Your Creation:</h3>
                        <img src={generatedImage} alt={prompt} className="w-full rounded-lg shadow-md" />
                    </div>
                )}
            </div>
        </div>
    );
};
