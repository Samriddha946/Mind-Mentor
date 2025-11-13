import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext, aiModels } from '../../contexts/AppContext';
import { DashboardIcon, UsersIcon, ChartBarIcon, ChipIcon, CogIcon, ChevronRightIcon, BrainIcon, OpenAIIcon, PerplexityIcon, GeminiIcon } from '../Icons';

type DashboardView = 'Overview' | 'Analytics' | 'AI Models';

const aiModelIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    openai: OpenAIIcon,
    perplexity: PerplexityIcon,
    gemini: GeminiIcon,
    brain: BrainIcon,
};

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="glass-card dashboard-glow-border rounded-lg p-4">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold font-orbitron">{value}</p>
    </div>
);

const BarChart: React.FC<{ data: { label: string, value: number }[], color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
        <div className="w-full h-64 flex items-end justify-around gap-2 p-4">
            {data.map((item, index) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="h-full w-full flex items-end">
                        <motion.div
                            className="w-full rounded-t-md chart-bar"
                            style={{ 
                                height: `${(item.value / maxValue) * 100}%`,
                                background: color,
                                boxShadow: `0 0 10px ${color}`,
                                animationDelay: `${index * 100}ms`
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.value / maxValue) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 truncate">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

const HealthMeter: React.FC<{ value: number }> = ({ value }) => (
    <div className="health-meter" style={{ '--value': value } as React.CSSProperties}>
        <span className="text-lg font-bold">{value}%</span>
    </div>
);

const OverviewPanel = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg shadow-lg">
                <BrainIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-orbitron">Mind Mentor</h2>
                <p className="text-gray-300">Your AI-powered study companion.</p>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value="1,234" />
            <StatCard title="Active Today" value="152" />
            <StatCard title="Total Messages" value="25,678" />
            <StatCard title="Avg. Session" value="12m 45s" />
        </div>
        <div className="glass-card dashboard-glow-border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">App Controls</h3>
            <div className="flex items-center justify-between">
                <p>App Visibility</p>
                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-300 rounded-md">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Public
                </div>
            </div>
             <div className="flex items-center justify-between">
                <p>Require Login</p>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
            </div>
        </div>
    </div>
);

const AnalyticsPanel = () => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold font-orbitron">Analytics Center</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card dashboard-glow-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Daily Active Users</h3>
                <BarChart color="var(--primary)" data={[
                    { label: 'Mon', value: 80 }, { label: 'Tue', value: 120 }, { label: 'Wed', value: 110 },
                    { label: 'Thu', value: 150 }, { label: 'Fri', value: 200 }, { label: 'Sat', value: 180 }, { label: 'Sun', value: 152 }
                ]} />
            </div>
            <div className="glass-card dashboard-glow-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Feature Engagement</h3>
                <BarChart color="var(--secondary)" data={[
                    { label: 'Chat', value: 250 }, { label: 'Games', value: 180 }, { label: 'Scheduler', value: 150 },
                    { label: 'Images', value: 120 }, { label: 'MindBuddy', value: 90 }
                ]} />
            </div>
        </div>
    </div>
);

const AIModelsPanel = () => {
    const context = useContext(AppContext);
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-orbitron">AI Models & Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(aiModels).map(model => {
                    const Icon = aiModelIcons[model.iconName];
                    return (
                        <div key={model.id} className="glass-card dashboard-glow-border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon className="w-8 h-8" style={{ color: model.theme.primary }} />}
                                    <h3 className="text-xl font-bold">{model.name}</h3>
                                </div>
                                 <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                </label>
                            </div>
                            <p className="text-sm text-gray-300">{model.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className="font-semibold text-green-400">Online</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Latency</p>
                                    <p className="font-semibold">~120ms</p>
                                </div>
                                <HealthMeter value={Math.floor(Math.random() * 10 + 90)} />
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="glass-card dashboard-glow-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">MindBuddy™ Personality</h3>
                <div className="flex items-center gap-4">
                    <label>Tone:</label>
                    <select className="bg-white/10 text-sm focus:outline-none appearance-none px-4 py-2 pr-8 rounded-md cursor-pointer">
                        <option className="bg-gray-800">Supportive Listener</option>
                        <option className="bg-gray-800">Chill Friend</option>
                        <option className="bg-gray-800">Study Partner</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export const DeveloperDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<DashboardView>('Overview');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const navItems: { id: DashboardView, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
        { id: 'Overview', label: 'Overview', icon: DashboardIcon },
        { id: 'Analytics', label: 'Analytics', icon: ChartBarIcon },
        { id: 'AI Models', label: 'AI Models', icon: ChipIcon },
    ];

    const renderView = () => {
        switch (activeView) {
            case 'Overview': return <OverviewPanel />;
            case 'Analytics': return <AnalyticsPanel />;
            case 'AI Models': return <AIModelsPanel />;
            default: return <OverviewPanel />;
        }
    };

    return (
        <div className="font-poppins h-full flex gap-4 text-white animate-fade-in-up">
            {/* Dashboard Sidebar */}
            <motion.aside
                className="glass-card flex flex-col p-3 rounded-2xl"
                initial={false}
                animate={{ width: isSidebarExpanded ? 220 : 60 }}
                onHoverStart={() => setIsSidebarExpanded(true)}
                onHoverEnd={() => setIsSidebarExpanded(false)}
            >
                <div className="flex items-center gap-3 mb-8" style={{ paddingLeft: '2px' }}>
                    <BrainIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                    <AnimatePresence>
                        {isSidebarExpanded && (
                            <motion.span initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="font-bold whitespace-nowrap">Admin</motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors ${activeView === item.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <item.icon className={`w-6 h-6 flex-shrink-0 ${activeView === item.id ? 'text-cyan-400' : 'text-gray-300'}`} />
                             <AnimatePresence>
                                {isSidebarExpanded && (
                                    <motion.span initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="whitespace-nowrap">{item.label}</motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </nav>
                 <div className="mt-auto">
                      <button className={`flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors hover:bg-white/10`}>
                            <CogIcon className="w-6 h-6 flex-shrink-0 text-gray-300" />
                             <AnimatePresence>
                                {isSidebarExpanded && (
                                    <motion.span initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="whitespace-nowrap">Settings</motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                 </div>
            </motion.aside>
            
            {/* Dashboard Content */}
            <main className="flex-1 glass-card rounded-2xl p-6 overflow-y-auto">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};