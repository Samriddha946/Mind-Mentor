import React, { useState, useContext } from 'react';
import { generateStudyPlan } from '../../services/geminiService';
import { AppContext } from '../../contexts/AppContext';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { recordActivity } from '../../services/statsService';

interface StudyTask {
    task: string;
    duration: number;
    reason: string;
    day: string;
    id: number;
}

const TaskCard: React.FC<{ task: StudyTask; onDismiss: (id: number) => void; onAccept: () => void; }> = ({ task, onDismiss, onAccept }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    const handleDismiss = () => {
        setIsDismissed(true);
        setTimeout(() => onDismiss(task.id), 300);
    };

    const handleAccept = () => {
        onAccept();
        setIsAccepted(true);
    };

    return (
        <div className={`glass-card p-5 rounded-xl transition-all duration-300 ${isDismissed ? 'opacity-0 -translate-x-8' : 'opacity-100'} ${isAccepted ? 'border-green-500/50' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">{task.day} &bull; {task.duration} mins</p>
                    <h4 className="text-xl font-bold mt-1 text-white">{task.task}</h4>
                </div>
                <span className="text-2xl">💡</span>
            </div>
            <p className="text-gray-300 mt-3">{task.reason}</p>
            <div className="flex justify-end gap-2 mt-4">
                 <button onClick={handleDismiss} disabled={isAccepted} className="text-sm text-gray-400 hover:text-white transition disabled:opacity-50 disabled:hover:text-gray-400">Dismiss</button>
                 <button onClick={handleAccept} disabled={isAccepted} className={`text-sm px-3 py-1 rounded-full transition ${isAccepted ? 'bg-green-500/80 text-white cursor-default' : 'bg-white/10 hover:bg-white/20'}`}>
                    {isAccepted ? 'Accepted!' : 'Accept'}
                 </button>
            </div>
        </div>
    );
};


export const Scheduler: React.FC = () => {
    const [goals, setGoals] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<StudyTask[] | null>(null);
    const context = useContext(AppContext);

    const handleSubmit = async () => {
        if (!goals || !context) {
            setError('Please enter your learning goals.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlan(null);

        try {
            const { mood, language, tone, activeAIModel } = context;
            const performance = "Completed 70% of last week's tasks, scored 85% on the last quiz.";
            const response = await generateStudyPlan(activeAIModel.engine, goals, mood.name, performance, language, tone);
            const planWithIds = response.plan.map((item, index) => ({ ...item, id: index }));
            setPlan(planWithIds);
        } catch (err) {
            console.error(err);
            setError('Failed to generate schedule. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDismissTask = (id: number) => {
        setPlan(currentPlan => currentPlan ? currentPlan.filter(task => task.id !== id) : null);
    };
    
    const handleAcceptTask = () => {
        if (context?.user) {
            recordActivity('task');
            context.refreshStats();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="font-orbitron text-4xl font-bold mb-4 text-glow">AI-Powered Scheduler</h2>
            <p className="text-lg text-gray-300 mb-6">Tell me your goals, and I'll create an actionable study schedule tailored to your mood and progress.</p>
            
            <div className="space-y-4">
                <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="e.g., Master React hooks and prepare for my upcoming data structures exam."
                    className="w-full p-4 themed-input rounded-lg"
                    rows={4}
                    disabled={isLoading}
                />
                <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || !goals}>
                    Generate My Schedule
                </Button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            <div className="mt-8">
                {isLoading && <Spinner message="Crafting your personalized schedule..." />}
                {plan && (
                    <div>
                        <h3 className="text-2xl font-satoshi font-bold mb-4">Your AI-Generated Schedule:</h3>
                        <div className="space-y-4">
                            {plan.map((task, index) => (
                                <div key={task.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                     <TaskCard task={task} onDismiss={handleDismissTask} onAccept={handleAcceptTask} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};