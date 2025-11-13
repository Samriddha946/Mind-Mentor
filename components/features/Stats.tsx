import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { StatsIcon, TrophyIcon, StudyPlannerIcon, SparklesIcon, BoltIcon, CheckIcon, ImageIcon } from '../Icons';
import { calculateLevelInfo, BADGES } from '../../services/statsService';
import type { Badge } from '../../services/statsService';

const badgeIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    trophy: TrophyIcon,
    check: CheckIcon,
    sparkles: SparklesIcon,
    image: ImageIcon,
    bolt: BoltIcon,
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glass-card p-4 rounded-lg flex items-center gap-4">
        <div className="text-cyan-400">{icon}</div>
        <div>
            <p className="text-gray-300 text-sm">{title}</p>
            <p className="text-white font-bold text-xl">{value}</p>
        </div>
    </div>
);

const BadgeCard: React.FC<{ badge: Badge, earned: boolean }> = ({ badge, earned }) => {
    const Icon = badgeIcons[badge.iconName];
    return (
        <div className={`p-4 rounded-lg flex items-center gap-4 transition-all duration-300 ${earned ? 'glass-card' : 'bg-black/20 opacity-60'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${earned ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]' : 'bg-gray-700'}`}>
                {Icon && <Icon className="w-7 h-7 text-white" />}
            </div>
            <div>
                <p className={`font-bold text-lg ${earned ? 'text-white' : 'text-gray-400'}`}>{badge.name}</p>
                <p className="text-sm text-gray-300">{badge.description}</p>
            </div>
        </div>
    );
};


export const Stats: React.FC = () => {
    const context = useContext(AppContext);

    if (!context || !context.user) {
        return (
            <div className="max-w-4xl mx-auto p-8 glass-card rounded-2xl shadow-lg text-center animate-fade-in-up">
                <h2 className="font-orbitron text-3xl font-bold mb-4">My Stats</h2>
                <p className="text-gray-300">Please sign in to view your stats and track your progress.</p>
            </div>
        );
    }
    
    if (!context.stats) {
        return (
            <div className="max-w-4xl mx-auto p-8 glass-card rounded-2xl shadow-lg text-center animate-fade-in-up">
                <h2 className="font-orbitron text-3xl font-bold mb-4">My Stats</h2>
                <p className="text-gray-300">Loading your stats...</p>
            </div>
        );
    }
    
    const { stats, user } = context;
    const { pointsForCurrentLevel, pointsForNextLevel, totalPointsForLevel } = calculateLevelInfo(stats.level);
    
    const currentLevelProgress = stats.points - pointsForCurrentLevel;
    const progressPercentage = totalPointsForLevel > 0 ? (currentLevelProgress / totalPointsForLevel) * 100 : 0;

    const allBadges = Object.values(BADGES);
    
    return (
        <div className="max-w-4xl mx-auto p-8 glass-card rounded-2xl shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
                <img src={user.photoURL} alt={user.name} className="w-20 h-20 rounded-full border-4 border-[var(--primary)]" />
                <div>
                    <h2 className="font-orbitron text-3xl font-bold">{user.name}</h2>
                    <p className="text-gray-300">Here's a look at your journey so far.</p>
                </div>
            </div>

            {/* Streak Section */}
            <div className="mb-8 p-5 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-between">
                <div>
                    <p className="text-sm uppercase tracking-wider text-amber-300 font-semibold">Study Streak</p>
                    <p className="font-orbitron text-4xl font-bold text-white">{stats.currentStreak} <span className="text-2xl">Days</span></p>
                </div>
                <BoltIcon className="w-16 h-16 text-amber-400" />
            </div>

            {/* Level and Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                         <TrophyIcon className="w-8 h-8 text-yellow-400" />
                         <div>
                            <p className="text-sm text-gray-400">Level</p>
                            <span className="font-orbitron text-4xl font-bold">{stats.level}</span>
                         </div>
                    </div>
                    <p className="text-gray-300 font-semibold">{stats.points} / {pointsForNextLevel} XP</p>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4">
                    <div
                        className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                 <p className="text-right text-sm mt-1 text-gray-400">
                    {pointsForNextLevel - stats.points} XP to next level
                </p>
            </div>

            {/* Detailed Stats Grid */}
            <h3 className="font-satoshi text-2xl font-bold mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Tasks Completed" value={stats.tasksCompleted} icon={<StudyPlannerIcon className="w-8 h-8" />} />
                <StatCard title="Chat Messages Sent" value={stats.chatMessages} icon={<SparklesIcon className="w-8 h-8" />} />
                <StatCard title="Content Generated" value={stats.contentGenerated} icon={<StatsIcon className="w-8 h-8" />} />
            </div>

            {/* Badges Section */}
            <div className="mt-8">
                <h3 className="font-satoshi text-2xl font-bold mb-4">Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allBadges.map(badge => (
                        <BadgeCard 
                            key={badge.id} 
                            badge={badge} 
                            earned={stats.badges.includes(badge.id)} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};