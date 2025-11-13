import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ImageIcon, ImageEditIcon, VideoIcon, MicIcon, GoogleIcon, BrainIcon, DocumentScannerIcon, VolumeUpIcon, StudyPlannerIcon, StatsIcon, GameIcon, BookOpenIcon } from './Icons';
import { AppContext } from '../contexts/AppContext';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
    const context = useContext(AppContext);
    const isReducedMotion = context?.isReducedMotion ?? false;

    const motionProps = isReducedMotion ? {} : {
        whileHover: { y: -8, boxShadow: '0 0 20px var(--glow-color)' },
        whileTap: { scale: 0.97 },
        transition: { type: 'spring', stiffness: 300, damping: 15 }
    };

    return (
        <motion.div
            {...motionProps}
            onClick={onClick}
            className="relative z-10 glass-card p-6 rounded-2xl shadow-lg transform transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg">
                {icon}
            </div>
            <h3 className="font-orbitron text-2xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-lg font-satoshi text-gray-300">{description}</p>
        </motion.div>
    );
};

interface HomeProps {
    setActiveView: (view: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveView }) => {
    const features = [
        { icon: <SparklesIcon />, title: 'AI Chatbot', description: 'Your personal AI mentor for any question.', view: 'AI Chatbot' },
        { icon: <StudyPlannerIcon />, title: 'AI Scheduler', description: 'Get a personalized study schedule.', view: 'Scheduler' },
        { icon: <MicIcon />, title: 'MindBuddy™', description: 'Chat with your AI friend in real-time.', view: 'MindBuddy' },
        { icon: <GameIcon />, title: 'GameVerse', description: 'Sharpen your mind with fun AI games.', view: 'GameVerse' },
        { icon: <StatsIcon />, title: 'My Stats', description: 'Track your progress and level up.', view: 'My Stats' },
        { icon: <ImageIcon />, title: 'Image Generator', description: 'Create stunning images from text prompts.', view: 'Image Generator' },
        { icon: <ImageEditIcon />, title: 'Image Editor', description: 'Modify your images with simple commands.', view: 'Image Editor' },
        { icon: <VideoIcon />, title: 'Video Generator', description: 'Bring your ideas to life with AI videos.', view: 'Video Generator' },
        { icon: <BookOpenIcon />, title: 'Study Materials', description: 'Upload and analyze your study notes.', view: 'Study Materials' },
        { icon: <DocumentScannerIcon />, title: 'Content Analyzer', description: 'Analyze images and videos for insights.', view: 'Content Analyzer' },
        { icon: <GoogleIcon />, title: 'Grounded Search', description: 'Get up-to-date answers from the web.', view: 'Grounded Search' },
        { icon: <BrainIcon />, title: 'Deep Thinker', description: 'Tackle complex problems with advanced AI.', view: 'Deep Thinker' },
        { icon: <VolumeUpIcon />, title: 'Speech Generator', description: 'Convert text into natural-sounding speech.', view: 'Speech Generator' },
    ];

    return (
        <div className="animate-fade-in-up">
            <h2 className="font-orbitron text-5xl md:text-6xl font-extrabold mb-3 text-white text-gradient-animated">Welcome to Mind Mentor</h2>
            <p className="text-xl text-gray-300 mb-10 font-satoshi">What would you like to explore today?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(feature => (
                    <FeatureCard
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        onClick={() => setActiveView(feature.view)}
                    />
                ))}
            </div>
        </div>
    );
};