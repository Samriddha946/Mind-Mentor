import React, { useEffect } from 'react';
import { BackArrowIcon, GeminiIcon, ReactIcon, TailwindIcon, LocationPinIcon } from './Icons';

interface AboutProps {
    setActiveView: (view: string) => void;
}

const TechCard: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="scroll-animate glass-card p-4 rounded-xl flex items-center gap-4 hover:shadow-cyan-400/30 transition-shadow">
        <div className="text-2xl">{icon}</div>
        <span className="font-semibold text-lg">{name}</span>
    </div>
);

export const About: React.FC<AboutProps> = ({ setActiveView }) => {
    
    useEffect(() => {
        const scrollElements = document.querySelectorAll('.scroll-animate');
        const elementInView = (el: Element, dividend = 1) => {
            const elementTop = el.getBoundingClientRect().top;
            return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
        };
        const displayScrollElement = (element: Element) => { element.classList.add('is-visible'); };
        
        const handleScroll = () => {
            scrollElements.forEach((el) => { if (elementInView(el, 1.25)) { displayScrollElement(el); } });
        };

        const scrollableContainer = document.querySelector('#about-page-scroller');
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
            return () => scrollableContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div id="about-page-scroller" className="h-full w-full overflow-y-auto font-satoshi text-lg text-gray-200 leading-relaxed">
            <button
                onClick={() => setActiveView('Home')}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-transform duration-300 hover:scale-105"
            >
                <BackArrowIcon className="w-5 h-5" />
                Back to App
            </button>

            <header className="h-screen flex flex-col items-center justify-center text-center p-8 relative bg-grid-pattern">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-start)] via-[var(--bg-start)] to-transparent"></div>
                <div className="relative z-10 animate-fade-in-up">
                    <h1 className="font-orbitron text-5xl md:text-7xl font-extrabold text-white text-gradient-animated mb-4">
                        Mind Mentor
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300">
                        A Student-Built AI Project
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-20 space-y-32">
                <section>
                    <h2 className="scroll-animate font-orbitron text-4xl font-bold text-center mb-12 text-gradient-animated">Our Vision</h2>
                    <div className="scroll-animate glass-card p-10 rounded-2xl border-l-4 border-cyan-400">
                         <blockquote className="text-xl md:text-2xl italic text-gray-200">
                            "At Mind Mentor, we believe that technology should understand you, not just respond to you. Our vision is to build an AI companion that helps people learn smarter, stay mindful, and grow emotionally — transforming everyday productivity into a journey of self-discovery."
                        </blockquote>
                        <p className="mt-6 text-gray-300">
                            By combining the power of advanced AI models like ChatGPT-5, Perplexity, and our custom intelligent core, Mind Mentor aims to bridge the gap between artificial intelligence and emotional awareness. Every mood, message, and interaction adapts dynamically to the user — creating a truly personalized and supportive environment for mental focus, reflection, and growth.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="scroll-animate font-orbitron text-4xl font-bold text-center mb-12 text-gradient-animated">The Developers</h2>
                     <div className="scroll-animate glass-card p-8 md:p-12 rounded-3xl">
                        <p className="text-center text-xl mb-10">Mind Mentor is created by two passionate developers — Vinay and Samriddha — who share a common goal of blending creativity with intelligent design.</p>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="text-center flex flex-col items-center">
                                <img src={`https://api.dicebear.com/8.x/bottts/svg?seed=Vinay`} alt="Vinay" className="w-32 h-32 rounded-full border-4 border-[var(--secondary)] mb-4" />
                                <h3 className="font-orbitron text-2xl font-bold text-white">Vinay</h3>
                                <p className="text-cyan-400 font-semibold mb-4">The Visionary</p>
                                <p>The visionary behind Mind Mentor, responsible for conceptualizing the idea, shaping the purpose, and driving the core direction of the app. His focus on emotional intelligence and personal growth inspired the foundation of this AI companion.</p>
                            </div>
                             <div className="text-center flex flex-col items-center">
                                <img src={`https://api.dicebear.com/8.x/bottts/svg?seed=Samriddha Sahu`} alt="Samriddha Sahu" className="w-32 h-32 rounded-full border-4 border-[var(--secondary)] mb-4" />
                                <h3 className="font-orbitron text-2xl font-bold text-white">Samriddha Sahu</h3>
                                <p className="text-cyan-400 font-semibold mb-4">The Innovator</p>
                                <p>The innovator who brought life to Mind Mentor through advanced feature integration, intuitive design, and seamless user experience. His technical insight ensures the app feels alive, empathetic, and easy to use.</p>
                            </div>
                        </div>
                         <p className="text-center text-lg mt-12 pt-8 border-t border-white/10">
                            Together, they combined their strengths in creativity, design, and AI to create a platform that’s not only functional but also emotionally intelligent and visually stunning.
                         </p>
                    </div>
                </section>

                <section>
                    <h2 className="scroll-animate font-orbitron text-4xl font-bold text-center mb-12">Our Roots</h2>
                    <div className="scroll-animate glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row">
                        <div className="p-10 flex-1">
                            <LocationPinIcon className="w-10 h-10 text-cyan-400 mb-4"/>
                            <h3 className="font-satoshi text-3xl font-bold text-white mb-2">Sage International School</h3>
                            <p className="text-lg text-gray-400 mb-6">Ayodhya Nagar, Bhopal, India</p>
                            <p>MindMentor is a proud creation from students of SIS, a place that fosters innovation, creativity, and a passion for technology. Developed by Vinay and Samriddha Sahu, this project embodies the spirit of learning and exploration encouraged by our school.</p>
                             <a
                                href="https://sisbhopal.edu.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-6 px-5 py-2.5 font-semibold text-white bg-white/10 rounded-lg transform hover:scale-105 transition-transform duration-300"
                            >
                                Visit School Website →
                            </a>
                        </div>
                        <div className="md:w-1/3 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', minHeight: '250px'}}>
                        </div>
                    </div>
                </section>
                
                <section>
                     <h2 className="scroll-animate font-orbitron text-4xl font-bold text-center mb-12">Powered By</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <TechCard name="Gemini API" icon={<GeminiIcon className="text-blue-400" />} />
                        <TechCard name="React" icon={<ReactIcon className="text-cyan-400" />} />
                        <TechCard name="Tailwind CSS" icon={<TailwindIcon className="text-teal-400" />} />
                     </div>
                </section>
                
            </main>
        </div>
    );
};