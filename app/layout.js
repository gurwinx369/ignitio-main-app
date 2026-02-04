'use client';

import {Inter, Pixelify_Sans} from "next/font/google";
import "./globals.css";
import {SmoothCursor} from "@/components/ui/smooth-cursor"
import {useEffect, useState} from 'react';
import Loader from '@/layout/Loader';
import {AuthProvider} from "@/features/context/AuthContext";
import {PostHogProvider} from './providers'

const inter = Inter({
    variable: "--font-inter",
    display: "swap",
    subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
    variable: "--font-pixelify",
    display: "swap",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"], // Multiple weights available
});

export default function RootLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <html lang="en">
            <head>
                {/* Preconnect to common video domains */}
                <link rel="preconnect" href="https://www.youtube.com"/>
                <link rel="preconnect" href="https://www.youtube-nocookie.com"/>
                <link rel="preconnect" href="https://i.ytimg.com"/>
                <link rel="dns-prefetch" href="https://www.youtube.com"/>
                <title></title>
            </head>
            <body className={`${inter.variable} ${pixelifySans.variable} antialiased`}>
            <Loader />
            </body>
            </html>
        );
    }

    return (
        <html lang="en">
        <body className={`${inter.variable} ${pixelifySans.variable} antialiased cursor-none`}>
        <SmoothCursor />
        <AuthProvider><PostHogProvider>{children}</PostHogProvider></AuthProvider>
        </body>
        </html>
    );
}
