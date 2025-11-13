import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const PerplexityBackground: React.FC = () => (
    <>
        {Array.from({ length: 20 }).map((_, i) => (
            <div
                key={i}
                className="absolute bg-gradient-to-b from-transparent to-[var(--primary)]/50"
                style={{
                    width: '1px',
                    height: '150px',
                    left: `${Math.random() * 100}%`,
                    top: '0%',
                    animationName: 'data-stream',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDuration: `${Math.random() * 5 + 3}s`,
                    animationDelay: `${Math.random() * 8}s`,
                }}
            />
        ))}
    </>
);

const GeminiBackground: React.FC = () => (
    <>
        {Array.from({ length: 15 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full border border-[var(--primary)]/30"
                style={{
                    width: '1px',
                    height: '1px',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationName: 'particle-bloom',
                    animationTimingFunction: 'ease-out',
                    animationIterationCount: 'infinite',
                    animationDuration: `${Math.random() * 4 + 4}s`,
                    animationDelay: `${Math.random() * 4}s`,
                }}
            />
        ))}
    </>
);

const SparklesBackground: React.FC = () => (
    <>
        {Array.from({ length: 25 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-[var(--primary)]"
                style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: '110%',
                    animation: `sparkle-rise ${Math.random() * 10 + 5}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`,
                    opacity: 0,
                }}
            />
        ))}
    </>
);

const RipplesBackground: React.FC = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full border border-[var(--primary)]/50"
                style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`,
                    width: '1px',
                    height: '1px',
                    animation: `ripple-expand ${Math.random() * 6 + 4}s ease-out infinite`,
                    animationDelay: `${Math.random() * 6}s`,
                }}
            />
        ))}
    </>
);

const CloudsBackground: React.FC = () => (
    <>
        {Array.from({ length: 8 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-[var(--primary)]/10 blur-2xl"
                style={{
                    width: `${Math.random() * 200 + 150}px`,
                    height: `${Math.random() * 150 + 100}px`,
                    left: '-20%',
                    top: `${Math.random() * 90}%`,
                    animation: `cloud-drift ${Math.random() * 40 + 20}s linear infinite alternate`,
                    animationDelay: `${Math.random() * 10}s`,
                }}
            />
        ))}
    </>
);


export const AnimatedBackground: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const renderAnimation = () => {
    switch (context.mood.animation.type) {
      case 'streaks':
        return <PerplexityBackground />;
      case 'aurora':
        return <GeminiBackground />;
      case 'sparkles':
        return <SparklesBackground />;
      case 'ripples':
        return <RipplesBackground />;
      case 'clouds':
        return <CloudsBackground />;
      default:
        return <GeminiBackground />;
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {renderAnimation()}
      </div>
    </div>
  );
};