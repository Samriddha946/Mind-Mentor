import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { BrainIcon, SparklesIcon, ImageIcon, CheckIcon, XIcon, GoogleGIcon, VideoIcon, MicIcon, StudyPlannerIcon, GoogleIcon, GameIcon, OpenAIIcon, PerplexityIcon, GeminiIcon } from './Icons';
import { aiModels, AppContext } from '../contexts/AppContext';

interface LandingPageProps {
  onLogin: () => void;
  onGuest: () => void;
}

const aiModelIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    openai: OpenAIIcon,
    perplexity: PerplexityIcon,
    gemini: GeminiIcon,
    brain: BrainIcon,
};

const AnimatedHeader: React.FC<{ text: string }> = ({ text }) => (
  <h2 className="scroll-animate font-orbitron text-4xl md:text-5xl font-extrabold text-white text-center">
    {text}
  </h2>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGuest }) => {
  const [isExiting, setIsExiting] = useState(false);
  const context = useContext(AppContext);
  const isReducedMotion = context?.isReducedMotion ?? false;
  
  useEffect(() => {
    const scrollElements = document.querySelectorAll('.scroll-animate');

    const elementInView = (el: Element, dividend = 1) => {
      const elementTop = el.getBoundingClientRect().top;
      return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
      );
    };

    const displayScrollElement = (element: Element) => {
      element.classList.add('is-visible');
    };

    const handleScroll = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
          displayScrollElement(el);
        }
      });
    };

    const scrollableContainer = document.querySelector('.font-sora.overflow-y-auto');
    const target = scrollableContainer || window;

    target.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on load
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogin = () => {
    setIsExiting(true);
    setTimeout(onLogin, 800);
  };

  const buttonMotionProps = isReducedMotion ? {} : {
      whileHover: { scale: 1.05, boxShadow: `0 0 15px var(--glow-color)` },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring', stiffness: 400, damping: 17 }
  };

  return (
    <div className={`font-sora bg-gradient-to-br from-[#0B132B] to-[#2E1A47] text-white overflow-y-auto h-screen w-screen transition-all duration-700 ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
      
      {/* Hero */}
      <section className="h-screen flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] to-transparent"></div>
        <div className="relative z-10 animate-fade-in-up">
            <div className="inline-block p-3 bg-white/10 rounded-xl mb-6">
                <BrainIcon className="w-12 h-12 text-gradient-animated" />
            </div>
            <h1 className="font-orbitron text-5xl md:text-7xl font-extrabold text-white text-gradient-animated mb-4">
                Mind Mentor
            </h1>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-8">
                Your AI-powered study companion, designed to help you learn smarter, not harder.
            </p>
            <motion.button
                {...buttonMotionProps}
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-lg rounded-full shadow-lg"
            >
                Discover Your Potential
            </motion.button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-8 bg-black/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent"></div>
        {!isReducedMotion && Object.values(aiModels).map((model, i) => {
            const Icon = aiModelIcons[model.iconName];
            return (
                <motion.div
                    key={model.id}
                    className="absolute"
                    style={{ color: model.theme.primary, opacity: 0.2 }}
                    initial={{ scale: 0, x: '50vw', y: '50vh' }}
                    animate={{
                        x: `${10 + Math.random() * 80}vw`,
                        y: `${10 + Math.random() * 80}vh`,
                        scale: [0, 1.2, 1],
                        rotate: Math.random() * 360,
                    }}
                    transition={{
                        duration: 20 + Math.random() * 20,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut',
                        delay: i * 2,
                    }}
                >
                    {Icon && <Icon className="w-12 h-12" />}
                </motion.div>
            );
        })}

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="scroll-animate font-orbitron text-4xl md:text-5xl font-extrabold text-white mb-6">
                About Mind Mentor
            </h2>
            <p className="scroll-animate text-lg md:text-xl text-gray-300 leading-relaxed">
                Mind Mentor is an AI-powered personal growth companion designed to help you focus, reflect, and thrive. 
                It blends emotional intelligence with advanced AI models like ChatGPT-5, Perplexity, and our custom AI core to provide smart conversations, mood tracking, and goal-oriented insights. 
                Built by creative minds Vinay and Samriddha, this project merges design, mindfulness, and futuristic AI technology into one seamless experience.
            </p>
        </div>
    </section>

      {/* Features */}
      <section id="features" className="py-24 px-8 bg-black/20">
        <div className="max-w-6xl mx-auto">
            <AnimatedHeader text="Everything You Need to Succeed" />
            <p className="scroll-animate max-w-2xl mx-auto text-center text-gray-300 text-xl mt-4 mb-16">
                From interactive chat to advanced content creation, Mind Mentor has you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { icon: <SparklesIcon />, title: "AI Chat", text: "Get instant answers and explanations on any topic." },
                    { icon: <StudyPlannerIcon />, title: "Smart Scheduler", text: "Let AI create a personalized study plan for you." },
                    { icon: <MicIcon />, title: "Voice Assistant", text: "Talk to your AI mentor for a hands-free experience." },
                    { icon: <ImageIcon />, title: "Image Generation", text: "Create visuals for your projects from simple text." },
                    { icon: <VideoIcon />, title: "Video Creation", text: "Bring ideas to life by generating short video clips." },
                    { icon: <GameIcon />, title: "GameVerse", text: "Sharpen your mind with fun, interactive AI games." },
                ].map((f, i) => (
                    <div key={i} className="scroll-animate glass-card p-8 rounded-2xl text-center flex flex-col items-center" style={{ transitionDelay: `${i * 100}ms` }}>
                        <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white">
                            {React.cloneElement(f.icon, { className: "w-8 h-8" })}
                        </div>
                        <h3 className="font-satoshi text-2xl font-bold mb-3">{f.title}</h3>
                        <p className="text-gray-300">{f.text}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* AI Showcase */}
        <section id="ai-showcase" className="py-24 px-8">
            <div className="max-w-6xl mx-auto">
                <AnimatedHeader text="Choose Your Mind" />
                <p className="scroll-animate max-w-2xl mx-auto text-center text-gray-300 text-xl mt-4 mb-16">
                    Switch between powerful AI engines, each with a unique personality and skill set, to find the perfect mentor for your task.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.values(aiModels).map((model, i) => {
                        const Icon = aiModelIcons[model.iconName];
                        return (
                        <div key={model.id} className="scroll-animate glass-card p-6 rounded-2xl" style={{ transitionDelay: `${i * 100}ms` }}>
                            <div className="flex items-center gap-3 mb-3">
                                {Icon && <Icon className="w-8 h-8 flex-shrink-0" style={{ color: model.theme.primary }} />}
                                <h3 className="font-satoshi text-xl font-bold">{model.name}</h3>
                            </div>
                            <p className="text-gray-300">{model.description}</p>
                        </div>
                    )})}
                </div>
            </div>
        </section>
      
      {/* Comparison */}
      <section className="py-24 px-8 bg-black/20">
        <div className="max-w-5xl mx-auto">
            <AnimatedHeader text="The Mind Mentor Advantage" />
             <div className="scroll-animate mt-12 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-4 font-satoshi text-xl font-bold">Feature</th>
                            <th className="p-4 font-satoshi text-xl font-bold text-center text-gradient-animated">Mind Mentor</th>
                            <th className="p-4 font-satoshi text-xl font-bold text-center">Other Tools</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {[
                            { feature: "Multi-AI Engine Choice", mm: true, other: false },
                            { feature: "Gamified Progress Tracking", mm: true, other: false },
                            { feature: "Personalized Study Scheduling", mm: true, other: "Manual"},
                            { feature: "Grounded, Up-to-Date Answers", mm: true, other: false },
                            { feature: "Ad-Free Experience", mm: true, other: "Varies" },
                        ].map(item => (
                             <tr key={item.feature}>
                                <td className="p-4 font-semibold text-lg">{item.feature}</td>
                                <td className="p-4 text-center">{item.mm ? <CheckIcon className="w-7 h-7 mx-auto text-green-400" /> : <XIcon className="w-7 h-7 mx-auto text-red-400" />}</td>
                                <td className="p-4 text-center">{typeof item.other === 'boolean' ? (item.other ? <CheckIcon className="w-7 h-7 mx-auto text-green-400" /> : <XIcon className="w-7 h-7 mx-auto text-red-400" />) : <span className="text-gray-400">{item.other}</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <div className="scroll-animate max-w-3xl mx-auto">
            <h2 className="font-orbitron text-5xl font-extrabold text-white mb-4">Ready to Begin?</h2>
            <p className="text-xl text-gray-300 mb-8">
                Sign in with your Google account to unlock your personalized learning dashboard and start your journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                    {...buttonMotionProps}
                    onClick={handleLogin}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-lg"
                >
                    <GoogleGIcon className="w-7 h-7" />
                    Sign In with Google
                </motion.button>
                <motion.button
                    {...buttonMotionProps}
                    onClick={onGuest}
                    className="w-full sm:w-auto px-8 py-3 btn-ghost rounded-full"
                >
                    Continue as Guest
                </motion.button>
            </div>
        </div>
      </section>
      
      <footer className="py-8 px-8 text-center text-gray-400 bg-black/30">
        <div className="max-w-6xl mx-auto">
            <p className="font-semibold text-lg mb-2">Developed by:</p>
            <p>👤 Vinay – Concept, Idea, and Product Vision</p>
            <p>🎨 Samriddha Sahu – Feature Design and User Experience</p>
            <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} Mind Mentor. A Student Project.</p>
        </div>
      </footer>

      <style>{`
        .bg-grid-pattern {
            background-image:
                linear-gradient(to right, rgba(125, 95, 255, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(125, 95, 255, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};