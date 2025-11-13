import React, { useState } from 'react';
import { getGroundedSearchResponse } from '../../services/geminiService';
import { Button } from '../common/Button';

export const GroundedSearch: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);

    const handleSubmit = async () => {
        if (!prompt) {
            setError('Please enter a question.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await getGroundedSearchResponse(prompt);
            setResult(response);
        } catch (err) {
            console.error(err);
            setError('Failed to get an answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Grounded Search Assistant</h2>
            <p className="text-gray-300 mb-6">Ask questions about recent events or topics to get up-to-date answers grounded in Google Search.</p>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Who won the latest F1 race?"
                    className="flex-grow p-3 themed-input rounded-lg"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                    Search
                </Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-6">
                {isLoading && (
                     <div className="w-full p-4 bg-black/30 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                )}
                {result && (
                    <div className="p-4 bg-black/30 rounded-lg animate-fade-in-up space-y-4">
                        <h3 className="text-xl font-semibold">Answer:</h3>
                        <p className="text-gray-200" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br />') }} />
                        
                        {result.sources.length > 0 && (
                            <div>
                                <h4 className="font-semibold">Sources:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {result.sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                                {source.web?.title || source.web?.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};