import React, { useState, useContext } from 'react';
import { getDeepThoughtResponse } from '../../services/geminiService';
import { Button } from '../common/Button';
import { AppContext } from '../../contexts/AppContext';

export const DeepThinker: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const context = useContext(AppContext);

    const handleSubmit = async () => {
        if (!prompt || !context) {
            setError('Please enter a complex problem or question.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const { activeAIModel } = context;
            const response = await getDeepThoughtResponse(activeAIModel.engine, prompt);
            setResult(response);
        } catch (err) {
            console.error(err);
            setError('Failed to process the request. The model may be unable to answer.');
        } finally {
            setIsLoading(false);
        }
    };

    const isProModelActive = context?.activeAIModel.engine === 'gemini-2.5-pro';

    return (
        <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Deep Thinker Mode</h2>
            <p className="text-gray-300 mb-6">Present a complex problem that requires multi-step reasoning. The AI will use its maximum "thinking" capacity to devise a solution.</p>
            
            {!isProModelActive && (
                <div className="p-4 mb-4 bg-yellow-900/50 border border-yellow-400/50 rounded-lg text-yellow-200">
                    <strong>Note:</strong> For the best results, switch to the <strong>Gemini Pro</strong> AI Core from the header. Deep thinking is optimized for that model.
                </div>
            )}
            
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Design a high-level system architecture for a global-scale, real-time multiplayer game..."
                    className="w-full p-3 themed-input rounded-lg"
                    rows={6}
                    disabled={isLoading}
                />
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                    Engage Deep Thinking
                </Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-6">
                {isLoading && (
                     <div className="w-full p-4 bg-black/30 rounded-lg animate-pulse space-y-4">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                )}
                {result && (
                    <div className="p-4 bg-black/30 rounded-lg animate-fade-in-up">
                        <h3 className="text-xl font-semibold">Solution:</h3>
                        <div className="mt-2 prose prose-invert max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
                    </div>
                )}
            </div>
        </div>
    );
};