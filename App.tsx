import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/features/Chatbot';
import { ImageGenerator } from './components/features/ImageGenerator';
import { ImageEditor } from './components/features/ImageEditor';
import { VideoGenerator } from './components/features/VideoGenerator';
import { MindBuddy } from './components/features/VoiceAssistant';
import { GroundedSearch } from './components/features/GroundedSearch';
import { DeepThinker } from './components/features/DeepThinker';
import { ContentAnalyzer } from './components/features/ContentAnalyzer';
import { StudyMaterials } from './components/features/StudyMaterials';
import { SpeechGenerator } from './components/features/SpeechGenerator';
import { Scheduler } from './components/features/Scheduler';
import { Stats } from './components/features/Stats';
import { GameVerse } from './components/features/GameVerse';
import { Home } from './components/Home';
import { About } from './components/About';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DeveloperDashboard } from './components/features/DeveloperDashboard';
import { AppContext, AppContextType, Mood, Theme, languages, tones, User, UserStats, AIModel, aiModels, moodThemes } from './contexts/AppContext';
import { getStats, initializeStats } from './services/statsService';
import { XIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mood, setMood] = useState<Mood>(moodThemes['focused']);
  const [language, setLanguage] = useState(languages[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [responseLength, setResponseLength] = useState('Standard');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeAIModel, setActiveAIModel] = useState<AIModel>(aiModels['chat-gpt-5']);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestWarningModal, setShowGuestWarningModal] = useState(false);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = mood.theme;
    
    root.style.setProperty('--mood-bg-start', currentTheme.bgStart);
    root.style.setProperty('--mood-bg-end', currentTheme.bgEnd);
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--secondary', currentTheme.secondary);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--glow-color', currentTheme.glow);
    root.style.setProperty('--font-body', `var(--font-${currentTheme.font.toLowerCase().replace(/ /g, '-')})`);

  }, [mood]);

  const refreshStats = useCallback(() => {
    if (user || isGuest) {
      const userStats = getStats();
      setStats(userStats);
    }
  }, [user, isGuest]);

  const login = useCallback(() => {
    const mockUser: User = {
      name: 'Vinay',
      email: 'vinay.creator@example.com',
      photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=vinay-admin`,
    };
    setUser(mockUser);
    setIsGuest(false);
    setGuestBannerDismissed(false);
    sessionStorage.setItem('mind-mentor-user', JSON.stringify(mockUser));
    initializeStats();
    refreshStats();
  }, [refreshStats]);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
        name: 'Guest',
        email: 'guest@example.com',
        photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=Guest`,
    };
    setUser(guestUser);
    setIsGuest(true);
    initializeStats();
    refreshStats();
    setShowGuestWarningModal(false);
  }, [refreshStats]);

  const logout = useCallback(() => {
    setUser(null);
    setStats(null);
    setIsGuest(false);
    setGuestBannerDismissed(false);
    sessionStorage.removeItem('mind-mentor-user');
    setActiveView('Home');
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('mind-mentor-user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        // Validate the parsed user object to prevent crashes from malformed data
        if (parsedUser && parsedUser.name && parsedUser.email) {
          setUser(parsedUser);
          initializeStats();
          const userStats = getStats();
          setStats(userStats);
        } else {
          throw new Error("Stored user data is malformed.");
        }
      } catch (error) {
        console.error("Failed to load user from session storage, clearing session.", error);
        sessionStorage.removeItem('mind-mentor-user');
        setUser(null); // Ensure user is null to show landing page
      }
    }
  }, []);
  
  const appContextValue: AppContextType = useMemo(() => ({
    theme,
    setTheme,
    mood,
    setMood,
    language,
    setLanguage,
    tone,
    setTone,
    responseLength,
    setResponseLength,
    user,
    login,
    logout,
    stats,
    refreshStats,
    activeAIModel,
    setActiveAIModel,
    isReducedMotion,
    setIsReducedMotion,
  }), [theme, mood, language, tone, responseLength, user, stats, refreshStats, activeAIModel, isGuest, isReducedMotion, login, logout]);

  const renderView = () => {
    switch (activeView) {
      case 'AI Chatbot': return <Chatbot />;
      case 'Image Generator': return <ImageGenerator />;
      case 'Image Editor': return <ImageEditor />;
      case 'Video Generator': return <VideoGenerator />;
      case 'MindBuddy': return <MindBuddy />;
      case 'Grounded Search': return <GroundedSearch />;
      case 'Deep Thinker': return <DeepThinker />;
      case 'Content Analyzer': return <ContentAnalyzer />;
      case 'Study Materials': return <StudyMaterials />;
      case 'Speech Generator': return <SpeechGenerator />;
      case 'Scheduler': return <Scheduler />;
      case 'My Stats': return <Stats />;
      case 'GameVerse': return <GameVerse />;
      case 'Developer Dashboard': return <DeveloperDashboard />;
      // About is now handled outside this function
      case 'Home':
      default:
        return <Home setActiveView={setActiveView} />;
    }
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className={`dark h-screen w-screen overflow-hidden bg-transparent text-gray-100 font-sora`}>
        {!user ? (
          <>
            <LandingPage onLogin={login} onGuest={() => setShowGuestWarningModal(true)} />
            {showGuestWarningModal && (
              <div className="modal-overlay animate-fade-in-up" style={{ animationDuration: '0.3s'}}>
                  <div className="modal-content glass-card rounded-2xl p-8 text-center">
                      <h2 className="text-2xl font-bold text-yellow-300 mb-4">⚠️ Guest Mode Warning</h2>
                      <p className="text-gray-200 mb-6">
                          If you continue without signing in, your progress, streaks, stats, and saved data won’t be stored or retrievable later.
                      </p>
                      <div className="flex justify-center gap-4">
                          <button onClick={() => setShowGuestWarningModal(false)} className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">Go Back</button>
                          <button onClick={loginAsGuest} className="px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold">Continue as Guest</button>
                      </div>
                  </div>
              </div>
            )}
          </>
        ) : (
          <div className={`relative h-full w-full flex transition-colors duration-500`}>
            <AnimatedBackground />
            {activeView === 'About' ? (
                <About setActiveView={setActiveView} />
            ) : (
                <>
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                    <main className="flex-1 flex flex-col h-full overflow-hidden">
                      <Header moodThemes={moodThemes} />
                      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        {renderView()}
                      </div>
                      {isGuest && !guestBannerDismissed && (
                        <div className="guest-banner glass-card rounded-full animate-fade-in-up">
                            <p className="font-semibold">🧩 You’re currently in Guest Mode.</p>
                            <button onClick={login} className="px-4 py-1.5 text-sm font-bold rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white">Sign In to Save</button>
                            <button onClick={() => setGuestBannerDismissed(true)} className="text-gray-400 hover:text-white"><XIcon className="w-5 h-5"/></button>
                        </div>
                      )}
                    </main>
                </>
            )}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;