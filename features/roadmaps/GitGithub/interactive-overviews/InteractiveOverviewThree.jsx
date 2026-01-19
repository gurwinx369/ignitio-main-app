"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function GitHubOverview() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        console.log("Continue clicked");
        router.push(
            "/roadmaps/git-github/interactive-overviews/fourth-overview",
        );
    };

    return (
        <div className="min-h-screen bg-[#F5EFE7] flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
            <div className="w-full max-w-[900px] flex flex-col">
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
                    className={`relative w-full rounded-2xl overflow-hidden mb-6 sm:mb-8 md:mb-10 transition-all duration-600 ease-out ${
                        isLoaded
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                    }`}
                    style={{
                        aspectRatio: "16 / 9",
                        maxWidth: "730px",
                        margin: "0 auto",
                        border: "2px dashed rgba(26, 26, 46, 0.2)",
                        backgroundColor: "rgba(245, 239, 231, 0.5)",
                        transitionDelay: "200ms",
                    }}
                >
                    <video
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                        playsInline
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23F5EFE7'/%3E%3C/svg%3E"
                    >
                        {/* Add your video source here */}
                        <source
                            src="/videos/git-overview.mp4"
                            type="video/mp4"
                        />
                    </video>
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                            fontFamily: "inherit",
                            fontSize: "clamp(0.875rem, 2vw, 1rem)",
                            fontWeight: 500,
                            color: "#999",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            textAlign: "center",
                            padding: "1rem",
                        }}
                    >
                        GitHub Explanation in Motion Graphics
                    </div>
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
                        transitionDelay: "300ms",
                    }}
                >
                    GitHub is where the world codes together - it&#39;s like
                    Google Docs, but for code. You can see how professionals
                    build apps, contribute to real projects, and show employers
                    what you&#39;ve built.
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
