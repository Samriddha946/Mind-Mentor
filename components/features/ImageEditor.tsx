import React, { useState, useRef } from 'react';
import { editImage } from '../../services/geminiService';
import { fileToBase64 } from '../../services/fileUtils';
import { Button } from '../common/Button';

export const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<{ file: File, base64: string, url: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setOriginalImage({ file, base64, url: URL.createObjectURL(file) });
                setEditedImage(null);
                setError(null);
            } catch (err) {
                setError("Failed to load image.");
            }
        }
    };

    const handleSubmit = async () => {
        if (!prompt || !originalImage) {
            setError('Please upload an image and provide an editing instruction.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const editedImageBytes = await editImage(originalImage.base64, originalImage.file.type, prompt);
            setEditedImage(`data:image/png;base64,${editedImageBytes}`);
        } catch (err) {
            console.error(err);
            setError('Failed to edit image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">AI Image Editor</h2>
            <p className="text-gray-300 mb-6">Upload an image and tell me how you want to change it.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">1. Upload Image</h3>
                    <div
                        className="w-full h-64 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-white/10 transition"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {originalImage ? (
                            <img src={originalImage.url} alt="Original" className="max-w-full max-h-full rounded-md" />
                        ) : (
                            <p className="text-gray-300">Click to upload an image</p>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                     <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold">2. Describe Your Edit</h3>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Add a retro filter, remove the person in the background"
                            className="w-full p-3 themed-input rounded-lg"
                            disabled={isLoading || !originalImage}
                        />
                    </div>
                     <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || !originalImage || !prompt} className="mt-4">
                        Edit Image
                    </Button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <div className="w-full h-96 border border-white/10 rounded-lg flex items-center justify-center bg-black/30">
                       {isLoading && (
                            <div className="flex flex-col items-center">
                                <p className="text-gray-300">Editing in progress...</p>
                            </div>
                        )}
                        {error && <p className="text-red-400 px-4 text-center">{error}</p>}
                        {editedImage && (
                            <img src={editedImage} alt="Edited" className="max-w-full max-h-full rounded-md animate-fade-in-up" />
                        )}
                        {!isLoading && !editedImage && !error && <p className="text-gray-400">Your edited image will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};