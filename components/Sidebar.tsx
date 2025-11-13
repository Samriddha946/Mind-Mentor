import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, SparklesIcon, ImageIcon, ImageEditIcon, VideoIcon, MicIcon, GoogleIcon, BrainIcon, DocumentScannerIcon, VolumeUpIcon, StudyPlannerIcon, StatsIcon, InformationCircleIcon, GameIcon, DashboardIcon, BookOpenIcon } from './Icons';
import { AppContext } from '../contexts/AppContext';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    const context = useContext(AppContext);
    const isReducedMotion = context?.isReducedMotion ?? false;

    const motionProps = isReducedMotion ? {} : {
        whileHover: { scale: 1.02, x: 5 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    };
    
    return (
        <motion.button
            {...motionProps}
            onClick={onClick}
            animate={{ 
                boxShadow: isActive && !isReducedMotion ? '0 0 12px var(--glow-color)' : 'none',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
            }}
            className={`flex items-center w-full px-4 py-3 text-lg font-semibold transition-colors duration-200 group rounded-lg ${
                isActive
                    ? `text-white shadow-lg`
                    : 'text-gray-300 hover:bg-white/10'
            }`}
        >
            <span className="mr-4">{icon}</span>
            <span className="font-satoshi">{label}</span>
        </motion.button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const context = useContext(AppContext);
    const user = context?.user;
    const isAdmin = user?.name === 'Vinay' || user?.name === 'Samriddha Sahu';

    const navItems = [
        { id: 'Home', icon: <HomeIcon />, label: 'Home' },
        { id: 'AI Chatbot', icon: <SparklesIcon />, label: 'AI Chatbot' },
        { id: 'Scheduler', icon: <StudyPlannerIcon />, label: 'Scheduler' },
        { id: 'MindBuddy', icon: <MicIcon />, label: 'MindBuddy™' },
        { id: 'GameVerse', icon: <GameIcon />, label: 'GameVerse' },
        { id: 'My Stats', icon: <StatsIcon />, label: 'My Stats' },
        { id: 'Image Generator', icon: <ImageIcon />, label: 'Image Generator' },
        { id: 'Image Editor', icon: <ImageEditIcon />, label: 'Image Editor' },
        { id: 'Video Generator', icon: <VideoIcon />, label: 'Video Generator' },
        { id: 'Study Materials', icon: <BookOpenIcon />, label: 'Study Materials' },
        { id: 'Content Analyzer', icon: <DocumentScannerIcon />, label: 'Content Analyzer' },
        { id: 'Grounded Search', icon: <GoogleIcon />, label: 'Grounded Search' },
        { id: 'Deep Thinker', icon: <BrainIcon />, label: 'Deep Thinker' },
        { id: 'Speech Generator', icon: <VolumeUpIcon />, label: 'Speech Generator' },
        { id: 'About', icon: <InformationCircleIcon />, label: 'About' },
    ];

    if (isAdmin) {
        navItems.push({ id: 'Developer Dashboard', icon: <DashboardIcon />, label: 'Dev Dashboard' });
    }

    return (
        <aside className="relative z-10 w-72 p-5 bg-black/20 backdrop-blur-lg border-r border-white/10 flex-shrink-0 hidden md:flex flex-col">
            <div className="flex items-center mb-10">
                <div className="p-2.5 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg mr-4 shadow-lg">
                    <BrainIcon className="w-7 h-7 text-white"/>
                </div>
                <h1 className="text-2xl font-bold text-white font-orbitron">Mind Mentor</h1>
            </div>
            <nav className="flex-1 space-y-3 overflow-y-auto">
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.id}
                        onClick={() => setActiveView(item.id)}
                    />
                ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-white/10 text-center text-xs text-gray-400">
                <p className="font-semibold text-sm mb-1">Created by</p>
                <p>Vinay & Samriddha Sahu</p>
            </div>
        </aside>
    );
};