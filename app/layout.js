'use client';

import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { useEffect, useState } from 'react';
import Loader from '@/layout/Loader';
import { AuthProvider } from "@/features/context/AuthContext";
import { PostHogProvider } from './providers';

const inter = Inter({
    variable: "--font-inter", display: "swap", subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
    variable: "--font-pixelify", display: "swap", subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
            {/* Always preconnect — no cost to having these present */}
            <link rel="preconnect" href="https://www.youtube.com" />
            <link rel="preconnect" href="https://www.youtube-nocookie.com" />
            <link rel="preconnect" href="https://i.ytimg.com" />
            <link rel="dns-prefetch" href="https://www.youtube.com" />
            <title>Ignitio Ai powered gen ai learning platform</title>
        </head>
        {/*
              Single stable <body>. Toggle cursor-none class only,
              don't swap the entire tree.
            */}
        <body
            className={`
                    ${inter.variable} ${pixelifySans.variable} antialiased
                    ${isLoading ? '' : 'cursor-none'}
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
