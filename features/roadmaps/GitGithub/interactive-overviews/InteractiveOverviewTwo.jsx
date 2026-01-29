"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause } from "lucide-react";

export default function GitHubOverview() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Delay video start by 2 seconds
        const videoTimer = setTimeout(() => {
            setShowVideo(true);
            if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }, 2000);
        return () => clearTimeout(videoTimer);
    }, []);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleContinue = () => {
        console.log("Continue clicked");
        router.push(
            "/home/roadmaps/git-github/interactive-overviews/third-overview",
        );
    };

    return (
        <div className="min-h-screen bg-[#F5EFE7] flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
            <div className="w-full max-w-225 flex flex-col">
                {/* Title */}
                <h1
                    className={`text-[#1a1a2e] font-extrabold tracking-tight mb-6 sm:mb-8 md:mb-10 transition-all duration-700 ease-out ${
                        isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                    }`}
                    style={{
                        fontSize: "clamp(1.875rem, 5vw + 0.5rem, 2.75rem)",
                        lineHeight: "1.15",
                        transitionDelay: "100ms",
                    }}
                >
                    MAP g2o - Git & GitHub
                </h1>

                {/* Video Container */}
                <div
                    className={`relative w-full rounded-2xl overflow-hidden mb-8 sm:mb-10 md:mb-12 transition-all duration-600 ease-out ${
                        isLoaded
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                    }`}
                    style={{
                        aspectRatio: "1 / 1",
                        maxWidth: "600px",
                        margin: "0 auto",
                        marginBottom: "clamp(2rem, 4vw, 3rem)",
                        border: "2px dashed rgba(26, 26, 46, 0.2)",
                        backgroundColor: "rgba(245, 239, 231, 0.5)",
                        transitionDelay: "200ms",
                    }}
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23F5EFE7'/%3E%3C/svg%3E"
                    >
                        <source src="/videos/git-overview.mp4" type="video/mp4"/>
                    </video>

                    {/* Play/Pause Button Overlay */}
                    {showVideo && (
                        <button
                            onClick={togglePlayPause}
                            className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200"
                            aria-label={isPlaying ? "Pause video" : "Play video"}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6" />
                            )}
                        </button>
                    )}
                </div>

                {/* Description Text */}
                <p
                    className={`text-[#1a1a2e] leading-relaxed mb-8 sm:mb-10 md:mb-12 transition-all duration-700 ease-out ${
                        isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                    }`}
                    style={{
                        fontSize: "clamp(1rem, 2vw + 0.125rem, 1.125rem)",
                        lineHeight: "1.7",
                        maxWidth: "730px",
                        margin: "0 auto",
                        marginBottom: "clamp(2rem, 4vw, 3rem)",
                        transitionDelay: "300ms",
                    }}
                >
                    Think of Git as your coding time machine - it lets you save
                    your progress, try new ideas without fear, and undo mistakes
                    instantly. Every developer uses it, from day one to decade
                    ten.
                </p>

                {/* Continue Button */}
                <div className="mt-4 flex justify-center align-centre">
                    <button
                        onClick={handleContinue}
                        onMouseDown={() => setButtonPressed(true)}
                        onMouseUp={() => setButtonPressed(false)}
                        onMouseLeave={() => setButtonPressed(false)}
                        className={`w-full max-w-md px-8 py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-150 ${isLoaded ? "fade-in-up" : "opacity-0"}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            backgroundColor: "#0EA5E9",
                            boxShadow: buttonPressed
                                ? "0 2px 0 #0284C7"
                                : "0 6px 0 #0284C7",
                            transform: buttonPressed
                                ? "translateY(4px)"
                                : "translateY(0)",
                            animationDelay: "0.5s",
                        }}
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        </div>
    );
}
