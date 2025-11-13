import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { generateQuizQuestion } from '../../services/geminiService';
import { recordActivity } from '../../services/statsService';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { BrainIcon, SparklesIcon, XIcon, CheckIcon } from '../Icons';

type GameState = 'idle' | 'loading' | 'playing' | 'finished';

interface Question {
    question: string;
    options: string[];
    answer: string;
}

const QuizVerse: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [gameState, setGameState] = useState<GameState>('idle');
    const [question, setQuestion] = useState<Question | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null);
    const timerRef = React.useRef<number | null>(null);
    const context = useContext(AppContext);

    const fetchQuestion = useCallback(async () => {
        if (!topic) return;
        setFeedback(null);
        try {
            const q = await generateQuizQuestion(topic);
            setQuestion(q);
            setTimeLeft(15);
        } catch (error) {
            console.error("Failed to fetch question:", error);
            setGameState('idle');
        }
    }, [topic]);

    const handleAnswer = useCallback((selectedOption: string | null) => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        
        setTimeLeft(currentTime => {
            const isCorrect = selectedOption === question?.answer;
            if (isCorrect) {
                const points = 10 + currentTime;
                setScore(s => s + points);
                setFeedback({ message: `Correct! +${points} MindCoins`, correct: true });
                if (context?.user) {
                    recordActivity('game', { mindCoins: points, points: Math.round(points / 2) });
                    context.refreshStats();
                }
            } else {
                setFeedback({ message: `Oops! The correct answer was: ${question?.answer}`, correct: false });
            }
            return currentTime; 
        });
        
        setTimeout(() => {
            fetchQuestion();
        }, 2000);
    }, [context, fetchQuestion, question]);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            handleAnswer(null);
        }
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [gameState, timeLeft, handleAnswer]);

    const startGame = () => {
        setScore(0);
        setGameState('loading');
        fetchQuestion().then(() => setGameState('playing'));
    };

    const endGame = () => {
        setGameState('finished');
    };

    const resetGame = () => {
        setGameState('idle');
        setTopic('');
        setQuestion(null);
        setScore(0);
    };

    return (
        <div className="glass-card p-6 rounded-2xl w-full max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-4 text-gradient-animated">QuizVerse</h3>
            {gameState === 'idle' && (
                <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                    <p className="text-center text-gray-300">Enter a topic to start the quiz!</p>
                    <input
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., Solar System, World History, React.js"
                        className="w-full themed-input p-3 rounded-lg"
                    />
                    <Button onClick={startGame} disabled={!topic}>Start Quiz</Button>
                </div>
            )}

            {gameState === 'loading' && <Spinner message="Generating your first question..." />}

            {(gameState === 'playing' || gameState === 'finished') && question && (
                <div className="animate-fade-in-up">
                    {gameState === 'finished' ? (
                        <div className="text-center">
                             <h4 className="text-3xl font-bold mb-4">Game Over!</h4>
                             <p className="text-xl mb-6">Your final score is: <span className="font-bold text-cyan-400">{score}</span> MindCoins</p>
                             <div className="flex gap-4 justify-center">
                                <Button onClick={resetGame} variant="secondary">Play Again</Button>
                                <Button onClick={() => setGameState('idle')}>Change Topic</Button>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg">Score: <span className="font-bold text-cyan-400">{score}</span></p>
                                <div className="text-2xl font-bold">{timeLeft}</div>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-2.5 mb-6">
                                <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${(timeLeft / 15) * 100}%`, transition: 'width 1s linear' }}></div>
                            </div>
                            <p className="text-xl font-semibold mb-6 text-center">{question.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {question.options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!feedback}
                                        className={`p-4 rounded-lg text-left transition-all duration-300 disabled:cursor-not-allowed
                                            ${feedback && option === question.answer ? 'bg-green-500/80' : ''}
                                            ${feedback && option !== question.answer ? 'bg-red-500/80 opacity-60' : ''}
                                            ${!feedback ? 'bg-white/10 hover:bg-white/20' : ''}
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
                            <div className="text-center mt-6">
                                <Button onClick={endGame} variant="secondary">End Game</Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export const GameVerse: React.FC = () => {
    return (
        <div className="animate-fade-in-up">
            <h2 className="font-orbitron text-5xl md:text-6xl font-extrabold mb-3 text-white text-gradient-animated">GameVerse</h2>
            <p className="text-xl text-gray-300 mb-10 font-satoshi">Learn, Play & Grow. Sharpen your brain with AI-powered games.</p>
            
            <div className="flex flex-col items-center">
                <QuizVerse />
                {/* Future games will be added here */}
            </div>
        </div>
    );
};