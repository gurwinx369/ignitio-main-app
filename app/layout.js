'use client';

import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { useEffect, useState } from 'react';
import Loader from '@/layout/Loader';
import { AuthProvider } from "@/features/context/AuthContext";
import { PostHogProvider } from './providers';

const inter = Inter({
    variable: "--font-inter",
    display: "swap",
    subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
    variable: "--font-pixelify",
    display: "swap",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Preload YouTube IFrame API on app mount to reduce cold-start latency
    useEffect(() => {
        if (typeof window === "undefined") return;

        const iframeApiSrc = "https://www.youtube.com/iframe_api";

        if (!window.YT && !document.querySelector(`script[src="${iframeApiSrc}"]`)) {
            const tag = document.createElement("script");
            tag.src = iframeApiSrc;
            tag.async = true;

            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        }
    }, []);

    return (
        <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://www.youtube.com" />
                <link rel="preconnect" href="https://www.youtube-nocookie.com" />
                <link rel="preconnect" href="https://i.ytimg.com" />
                <link rel="dns-prefetch" href="https://www.youtube.com" />
                <title>Ignitio AI Powered Gen AI Learning Platform</title>
            </head>

            <body
                className={`
                    ${inter.variable} ${pixelifySans.variable} antialiased
                    ${isLoading ? "" : "cursor-none"}
                `}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        <SmoothCursor />
                        <AuthProvider>
                            <PostHogProvider>{children}</PostHogProvider>
                        </AuthProvider>
                    </>
                )}
            </body>
        </html>
    );
}