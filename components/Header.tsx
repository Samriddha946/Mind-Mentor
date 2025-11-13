import React, { useContext, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext, languages, tones, responseLengths, aiModels } from '../contexts/AppContext';
import type { Mood } from '../contexts/AppContext';
import { ChevronDownIcon, GoogleGIcon, OpenAIIcon, PerplexityIcon, GeminiIcon, BrainIcon } from './Icons';

interface HeaderProps {
    moodThemes: Record<string, Mood>;
}

const aiModelIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    openai: OpenAIIcon,
    perplexity: PerplexityIcon,
    gemini: GeminiIcon,
    brain: BrainIcon,
};

const CustomSelect: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string; label: string}[] }> = ({ value, onChange, options }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className="bg-transparent text-sm focus:outline-none appearance-none px-3 py-1 pr-8 rounded-md cursor-pointer"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-800 text-base">{opt.label}</option>
            ))}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ moodThemes }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { 
        mood, setMood, language, setLanguage, tone, setTone, responseLength, setResponseLength, 
        user, login, logout, activeAIModel, setActiveAIModel, isReducedMotion, setIsReducedMotion
    } = context;

    const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
    const [aiCoreDropdownOpen, setAiCoreDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const ActiveModelIcon = aiModelIcons[activeAIModel.iconName];

    const motionProps = isReducedMotion ? {} : {
        whileHover: { scale: 1.05, boxShadow: `0 0 12px var(--glow-color)` },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 400, damping: 17 }
    };

    return (
        <header className="relative z-10 flex-shrink-0 p-4 bg-black/20 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
            <div>
                <h1 className="font-satoshi text-2xl font-bold text-white">{greeting}, {user ? user.name.split(' ')[0] : 'Learner'}!</h1>
                <p className="text-md text-gray-300">Ready to conquer your goals?</p>
            </div>
            <div className="flex items-center space-x-4">
                 {/* AI Core Selector */}
                <div className="relative">
                    <motion.button {...motionProps} onClick={() => setAiCoreDropdownOpen(!aiCoreDropdownOpen)} className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg transition-colors hover:bg-white/20">
                        {ActiveModelIcon && <ActiveModelIcon className="w-5 h-5" style={{ color: activeAIModel.theme.primary }} />}
                        <span className="font-semibold">{activeAIModel.name}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${aiCoreDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>
                    <AnimatePresence>
                    {aiCoreDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-72 glass-card rounded-lg shadow-xl py-1">
                            {Object.values(aiModels).map(model => {
                                const Icon = aiModelIcons[model.iconName];
                                return (
                                <button key={model.id} onClick={() => { setActiveAIModel(model); setAiCoreDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-start space-x-3">
                                    {Icon && <Icon className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: model.theme.primary }} />}
                                    <div>
                                        <p className="font-semibold">{model.name}</p>
                                        <p className="text-sm text-gray-300">{model.description}</p>
                                    </div>
                                </button>
                            )})}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                 {/* Mood Selector */}
                <div className="relative">
                    <motion.button {...motionProps} onClick={() => setMoodDropdownOpen(!moodDropdownOpen)} className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg transition-colors hover:bg-white/20">
                        <span>{mood.emoji}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${moodDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>
                    <AnimatePresence>
                    {moodDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-xl py-1">
                            {Object.values(moodThemes).map(m => (
                                <button key={m.name} onClick={() => { setMood(m); setMoodDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center space-x-2">
                                    <span>{m.emoji}</span>
                                    <span>{m.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                {/* AI Settings */}
                <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-lg p-1 border border-transparent">
                   <CustomSelect value={language} onChange={e => setLanguage(e.target.value)} options={languages} />
                   <div className="w-px h-5 bg-white/20"></div>
                   <CustomSelect value={tone} onChange={e => setTone(e.target.value)} options={tones} />
                   <div className="w-px h-5 bg-white/20"></div>
                   <CustomSelect value={responseLength} onChange={e => setResponseLength(e.target.value)} options={responseLengths} />
                </div>
                
                {/* Auth Section */}
                {user ? (
                    <div className="relative">
                        <motion.button {...motionProps} onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="w-12 h-12 rounded-full border-2 border-cyan-400 focus:outline-none">
                            <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        </motion.button>
                         <AnimatePresence>
                         {userDropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-xl py-1">
                                <div className="px-4 py-2 border-b border-white/10">
                                    <p className="font-bold text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="px-4 py-3 border-b border-white/10">
                                    <label className="flex items-center justify-between cursor-pointer text-sm text-gray-200">
                                        <span>Reduce Motion</span>
                                        <input type="checkbox" checked={isReducedMotion} onChange={() => setIsReducedMotion(!isReducedMotion)} className="sr-only peer" />
                                        <div className="relative w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                                    </label>
                                </div>
                                <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10">
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.button {...motionProps} onClick={login} className="flex items-center space-x-2 px-4 py-2 bg-white/90 text-gray-900 rounded-lg hover:bg-white transition font-semibold">
                        <GoogleGIcon className="w-5 h-5" />
                        <span>Sign In</span>
                    </motion.button>
                )}
            </div>
        </header>
    );
};