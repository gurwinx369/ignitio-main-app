"use client"
import React, { useState, useEffect } from 'react';

export default function WhyLearnGitFirst() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 1000)
        return () => clearTimeout(timer)
    }, []);

    const handleContinue = () => {
        console.log('Continue clicked');
    };

    const features = [
        "Git & GitHub aren't optional, they're essential",
        "Every project you build becomes showcase-ready automatically",
        "Connects all coders, whether building apps, AI, or robots"
    ];

    return (
        <div className="min-h-screen bg-[#F5EFE7] flex flex-col items-center justify-center px-4 py-12 sm:px-6 md:px-8">
            <div className="w-full max-w-[900px] flex flex-col items-center">
                {/* Title */}
                <h1
                    className={`text-[#1a1a2e] font-extrabold tracking-tight text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ease-out ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                        fontSize: 'clamp(2rem, 6vw + 0.5rem, 3.5rem)',
                        lineHeight: '1.2',
                        maxWidth: '800px',
                        transitionDelay: '100ms'
                    }}
                >
                    Why Learn Git & GitHub First?
                </h1>

                {/* Features List */}
                <div className="w-full max-w-[750px] mb-12 sm:mb-16 md:mb-20 space-y-6 sm:space-y-8 md:space-y-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-4 sm:gap-6 transition-all duration-700 ease-out ${
                                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                            style={{
                                transitionDelay: `${200 + index * 150}ms`
                            }}
                        >
                            {/* Chevron Icon */}
                            <div className="flex-shrink-0 text-[#1a1a2e] font-bold pt-1"
                                 style={{
                                     fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                                     lineHeight: '1'
                                 }}
                            >
                                »
                            </div>

                            {/* Feature Text */}
                            <p
                                className="text-[#1a1a2e] font-medium leading-relaxed"
                                style={{
                                    fontSize: 'clamp(1.125rem, 2.5vw + 0.25rem, 1.5rem)',
                                    lineHeight: '1.5',
                                    paddingTop: 'clamp(0.25rem, 1vw, 0.5rem)'
                                }}
                            >
                                {feature}
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
                        animationDelay: '0.5s'
                    }}
                >
                    CONTINUE
                </button>
            </div>
        </div>
    );
}
