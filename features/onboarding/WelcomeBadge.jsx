"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {ConfettiButton} from "@/components/ui/confetti"
import Image from "next/image";

export default function WelcomeBadgePage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 1000)
        return () => clearTimeout(timer);
    }, []);

    const handleCollect = () => {
        // Save badge collection to localStorage
        localStorage.setItem('priority_badge_collected', JSON.stringify({
            collectedAt: new Date().toISOString(),
            badgeType: 'priority_user'
        }));
// Navigate to next page (e.g., roadmap or dashboard)
        router.push('/home');
    };

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
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .scale-in {
          animation: scaleIn 1s ease-out forwards;
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        @media (max-width: 640px) {
          .responsive-heading {
            font-size: 2.5rem !important;
          }
          .responsive-subheading {
            font-size: 1rem !important;
          }
          .responsive-badge {
            width: 280px !important;
            height: 280px !important;
          }
          .responsive-footer-text {
            font-size: 0.95rem !important;
            padding: 0 1.5rem;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .responsive-heading {
            font-size: 3.5rem !important;
          }
          .responsive-badge {
            width: 340px !important;
            height: 340px !important;
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
                        className={`responsive-heading text-center mb-4 font-bold ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: '#1a1a2e',
                            fontSize: '4rem',
                            letterSpacing: '-0.02em',
                            animationDelay: '0.1s'
                        }}
                    >
                        Congratulations
                    </h1>

                    {/* Subheading */}
                    <p
                        className={`responsive-subheading text-center mb-16 ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: '#666',
                            fontSize: '1.25rem',
                            fontWeight: '400',
                            animationDelay: '0.2s'
                        }}
                    >
                        you have got the special priority badge
                    </p>

                    <div
                        className={`responsive-badge relative mb-16 ${isLoaded ? 'scale-in float-animation' : 'opacity-0'}`}
                        style={{
                            width: '380px',
                            height: '380px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'transparent',
                            animationDelay: '0.3s'
                        }}
                    >
                        {/* Shimmer overlay */}
                        <div
                            className="absolute inset-0 shimmer-effect pointer-events-none"
                            style={{
                                borderRadius: '50%'
                            }}
                        />

                        {/* Badge Image */}
                        <Image
                            src="/badges/priority-badge.png"
                            alt="Priority Badge"
                            height={380}
                            width={380}
                            quality={100}
                            className="w-full h-full object-cover" // changed to object-cover
                            style={{
                                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
                                borderRadius: '50%',
                                mixBlendMode: 'multiply'
                            }}
                        />
                    </div>

                    {/* Collect Button */}

                    <ConfettiButton onClick={handleCollect}
                        options={{
                            particleCount: 200,
                            spread: 100,
                            origin: { y: 0.6 }
                        }}
                    >
                        COLLECT NOW
                    </ConfettiButton>
                </div>

                {/* Footer Text */}
                <p
                    className={`responsive-footer-text text-center max-w-2xl mx-auto mt-12 ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        color: '#666',
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        animationDelay: '0.6s'
                    }}
                >
                    you are on our special users list which got the latest updates, features and offers first
                </p>
            </div>
        </>
    );
}
