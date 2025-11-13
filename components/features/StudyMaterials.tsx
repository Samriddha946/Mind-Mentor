import React, { useState, useRef, useContext } from 'react';
import { analyzeImage, analyzeVideo, generateQuizFromContent } from '../../services/geminiService';
import { fileToBase64 } from '../../services/fileUtils';
import { Button } from '../common/Button';
import { AppContext } from '../../contexts/AppContext';
import { recordActivity } from '../../services/statsService';
import { Spinner } from '../common/Spinner';
import { QuillIcon, BrainIcon, GameIcon, SparklesIcon, CheckIcon, XIcon } from '../Icons';

type MediaType = 'image' | 'video';
type AnalysisType = 'summary' | 'keyPoints' | 'quiz' | 'question';

interface Material {
    id: number;
    file: File;
    type: MediaType;
    url: string;
    base64: string;
}

interface Quiz {
    question: string;
    options: string[];
    answer: string;
}

const QuizView: React.FC<{ quiz: Quiz, onComplete: () => void }> = ({ quiz, onComplete }) => {
    const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null);
    const [answered, setAnswered] = useState(false);

    const handleAnswer = (selectedOption: string) => {
        if (answered) return;
        setAnswered(true);
        const isCorrect = selectedOption === quiz.answer;
        if (isCorrect) {
            setFeedback({ message: 'Correct!', correct: true });
        } else {
            setFeedback({ message: `The correct answer was: ${quiz.answer}`, correct: false });
        }
        setTimeout(onComplete, 3000);
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <p className="font-semibold text-lg">{quiz.question}</p>
            <div className="grid grid-cols-1 gap-3">
                {quiz.options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(option)}
                        disabled={answered}
                        className={`p-3 rounded-lg text-left transition-all duration-300 disabled:cursor-not-allowed
                            ${answered && option === quiz.answer ? 'bg-green-500/80' : ''}
                            ${answered && option !== quiz.answer ? 'bg-red-500/80 opacity-60' : ''}
                            ${!answered ? 'bg-white/10 hover:bg-white/20' : ''}
                        `}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {feedback && (
                <div className={`mt-4 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2 ${feedback.correct ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                    {feedback.correct ? <CheckIcon className="w-6 h-6"/> : <XIcon className="w-6 h-6"/>}
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export const StudyMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | Quiz | null>(null);
    const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
    const [userQuestion, setUserQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const context = useContext(AppContext);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                const type = file.type.startsWith('image/') ? 'image' : 'video';
                const newMaterial: Material = {
                    id: Date.now(),
                    file,
                    type,
                    url: URL.createObjectURL(file),
                    base64,
                };
                setMaterials(prev => [...prev, newMaterial]);
                setSelectedMaterial(newMaterial);
                setAnalysisResult(null);
                setError(null);
            } catch (err) {
                setError("Failed to load file.");
            }
        }
    };

    const handleAnalysis = async (type: AnalysisType, customPrompt?: string) => {
        if (!selectedMaterial) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setAnalysisType(type);

        try {
            const { base64, file: { type: mimeType } } = selectedMaterial;
            let result: string | Quiz;

            if (type === 'quiz') {
                result = await generateQuizFromContent(base64, mimeType);
            } else {
                let prompt = '';
                if (type === 'summary') prompt = "Summarize this content concisely in a single paragraph.";
                else if (type === 'keyPoints') prompt = "Extract the key points from this content. Present them as a bulleted list using '*' for each point.";
                else if (type === 'question' && customPrompt) prompt = customPrompt;

                if (selectedMaterial.type === 'image') {
                    result = await analyzeImage(base64, mimeType, prompt);
                } else {
                    result = await analyzeVideo(base64, mimeType, prompt);
                }
            }
            
            setAnalysisResult(result);
            if (context?.user) {
                recordActivity('analyze');
                context.refreshStats();
            }

        } catch (err) {
            console.error(err);
            setError('Failed to analyze content. The AI may not be able to process this request.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto p-6 glass-card rounded-2xl shadow-lg animate-fade-in-up space-y-8">
            <div>
                <h2 className="font-orbitron text-4xl font-bold text-glow">Study Materials Hub</h2>
                <p className="text-lg text-gray-300">Upload your content, get AI insights, and accelerate your learning.</p>
            </div>
            
            {/* Upload and Library Section */}
            <div className="space-y-4">
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Upload New Material</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                {materials.length > 0 && (
                    <div className="flex space-x-4 p-2 overflow-x-auto">
                        {materials.map(material => (
                            <div key={material.id} onClick={() => {setSelectedMaterial(material); setAnalysisResult(null);}} className={`cursor-pointer p-1.5 rounded-lg flex-shrink-0 w-32 h-24 bg-black/30 transition-all duration-300 ${selectedMaterial?.id === material.id ? 'ring-2 ring-[var(--primary)]' : 'hover:scale-105'}`}>
                                {material.type === 'image' ? (
                                    <img src={material.url} alt={material.file.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                    <video src={material.url} className="w-full h-full object-cover rounded-md" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interaction Section */}
            {selectedMaterial && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div className="space-y-4">
                        <h3 className="font-satoshi text-xl font-bold">{selectedMaterial.file.name}</h3>
                        <div className="w-full aspect-video bg-black/30 rounded-lg overflow-hidden">
                             {selectedMaterial.type === 'image' ? (
                                <img src={selectedMaterial.url} alt="Selected content" className="w-full h-full object-contain" />
                            ) : (
                                <video src={selectedMaterial.url} controls className="w-full h-full" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => handleAnalysis('summary')} disabled={isLoading} variant="secondary"><QuillIcon className="w-5 h-5 mr-2" /> Summarize</Button>
                            <Button onClick={() => handleAnalysis('keyPoints')} disabled={isLoading} variant="secondary"><BrainIcon className="w-5 h-5 mr-2" /> Key Points</Button>
                            <Button onClick={() => handleAnalysis('quiz')} disabled={isLoading} variant="secondary"><GameIcon className="w-5 h-5 mr-2" /> Generate Quiz</Button>
                        </div>
                        <div className="space-y-2">
                             <input type="text" value={userQuestion} onChange={e => setUserQuestion(e.target.value)} placeholder="Ask a question about the content..." className="w-full themed-input p-3 rounded-lg" disabled={isLoading} />
                             <Button onClick={() => handleAnalysis('question', userQuestion)} disabled={isLoading || !userQuestion}><SparklesIcon className="w-5 h-5 mr-2" /> Ask AI</Button>
                        </div>
                        <div className="p-4 bg-black/30 rounded-lg min-h-[200px]">
                            {isLoading && <Spinner message={`AI is analyzing...`} />}
                            {error && <p className="text-red-400">{error}</p>}
                            {analysisResult && !isLoading && (
                                analysisType === 'quiz' && typeof analysisResult === 'object' ? (
                                    <QuizView quiz={analysisResult as Quiz} onComplete={() => setAnalysisResult(null)} />
                                ) : (
                                    <div className="prose prose-invert max-w-none text-gray-200 animate-fade-in-up" dangerouslySetInnerHTML={{ __html: String(analysisResult).replace(/\*/g, '•').replace(/\n/g, '<br />') }} />
                                )
                            )}
                            {!isLoading && !analysisResult && !error && <p className="text-gray-400 text-center">Your AI analysis will appear here.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};