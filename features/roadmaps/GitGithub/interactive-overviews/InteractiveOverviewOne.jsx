"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InteractiveOverviewOne() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 1000)
        return () => clearTimeout(timer)
    }, []);

    const handleContinue = () => {
        // Save progress to localStorage
        localStorage.setItem('roadmap_progress', JSON.stringify({
            completedMaps: ['git-github'],
            currentMap: 'git-github',
            timestamp: new Date().toISOString()
        }));

        // Navigate to next page (e.g., lessons)
        router.push('/lessons/git-github/intro');
    };

    const benefits = [
        "Build websites and mobile apps with teams without overwriting each other's code, test features safely",
        "Save every model version, compare results, and share breakthroughs with researchers worldwide"
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .pop-in {
          animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .benefit-item {
          transition: all 0.3s ease;
        }
        
        .benefit-item:hover {
          transform: translateX(8px);
        }
        
        @media (max-width: 640px) {
          .responsive-heading {
            font-size: 2rem !important;
          }
          .responsive-logos {
            width: 200px !important;
            height: 200px !important;
          }
          .responsive-benefit-text {
            font-size: 0.95rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .responsive-heading {
            font-size: 2.75rem !important;
          }
          .responsive-logos {
            width: 260px !important;
            height: 260px !important;
          }
        }
      `}</style>

            <div
                className="min-h-screen flex flex-col items-center justify-between py-12 px-6"
                style={{ backgroundColor: '#F5EFE7' }}
            >
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
                    {/* Heading */}
                    <h1
                        className={`responsive-heading text-center mb-16 font-bold ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: '#1a1a2e',
                            fontSize: '3.5rem',
                            letterSpacing: '-0.02em',
                            animationDelay: '0.1s'
                        }}
                    >
                        MAP g2o - Git & GitHub
                    </h1>

                    {/* Logos Container */}
                    <div
                        className={`responsive-logos relative mb-16 ${isLoaded ? 'pop-in' : 'opacity-0'}`}
                        style={{
                            width: '300px',
                            height: '300px',
                            animationDelay: '0.2s'
                        }}
                    >
                        <svg viewBox="0 0 300 300" className="w-full h-full">
                            {/* Git Logo (Left - Red/Orange) */}
                            <g transform="translate(40, 100)">
                                {/* Background rounded square */}
                                <rect
                                    x="0"
                                    y="0"
                                    width="120"
                                    height="120"
                                    rx="20"
                                    fill="#E84E31"
                                />
                                {/* Git branch icon */}
                                <circle cx="35" cy="35" r="12" fill="white" />
                                <circle cx="85" cy="85" r="12" fill="white" />
                                <circle cx="85" cy="35" r="12" fill="white" />
                                {/* Branch lines */}
                                <line x1="35" y1="47" x2="35" y2="65" stroke="white" strokeWidth="6" strokeLinecap="round" />
                                <path d="M 35 65 Q 35 85, 73 85" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
                                <line x1="85" y1="47" x2="85" y2="73" stroke="white" strokeWidth="6" strokeLinecap="round" />
                            </g>

                            {/* GitHub Logo (Right - Blue) */}
                            <g transform="translate(140, 100)">
                                {/* Background circle */}
                                <circle cx="60" cy="60" r="60" fill="#1B1F23" />
                                {/* Octocat silhouette */}
                                <path
                                    d="M 60 20 C 37 20 18 39 18 62 C 18 80 30 95 46 100 C 48 100 49 99 49 97 L 49 90 C 38 92 36 84 36 84 C 34 79 31 77 31 77 C 27 74 31 74 31 74 C 35 74 37 78 37 78 C 41 85 47 83 49 82 C 49 80 50 78 52 77 C 43 76 34 73 34 62 C 34 58 36 55 38 52 C 37 51 36 47 38 42 C 38 42 42 41 49 45 C 52 44 56 44 60 44 C 64 44 68 44 71 45 C 78 41 82 42 82 42 C 84 47 83 51 82 52 C 84 55 86 58 86 62 C 86 73 77 76 68 77 C 70 78 71 81 71 84 L 71 97 C 71 99 72 100 74 100 C 90 95 102 80 102 62 C 102 39 83 20 60 20 Z"
                                    fill="white"
                                />
                            </g>
                        </svg>
                    </div>

                    {/* Benefits List */}
                    <div className="w-full max-w-2xl space-y-6 mb-16">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className={`benefit-item flex items-start gap-4 ${isLoaded ? 'slide-in-left' : 'opacity-0'}`}
                                style={{ animationDelay: `${0.4 + index * 0.15}s` }}
                            >
                                {/* Chevron Icon */}
                                <div
                                    className="flex-shrink-0 mt-1"
                                    style={{ width: '24px', height: '24px' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                        <path
                                            d="M9 6L15 12L9 18"
                                            stroke="#666"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                {/* Benefit Text */}
                                <p
                                    className="responsive-benefit-text flex-1"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        color: '#666',
                                        fontSize: '1.1rem',
                                        lineHeight: '1.7',
                                        fontWeight: '400'
                                    }}
                                >
                                    {benefit}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        onMouseDown={() => setButtonPressed(true)}
                        onMouseUp={() => setButtonPressed(false)}
                        onMouseLeave={() => setButtonPressed(false)}
                        className={`w-full max-w-md px-8 py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-150 ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            backgroundColor: '#0EA5E9',
                            boxShadow: buttonPressed ? '0 2px 0 #0284C7' : '0 6px 0 #0284C7',
                            transform: buttonPressed ? 'translateY(4px)' : 'translateY(0)',
                            animationDelay: '0.7s'
                        }}
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        </>
    );
}
