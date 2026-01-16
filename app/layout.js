'use client';

import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import { useState, useEffect } from 'react';
import Loader from '@/layout/Loader';
import {AuthProvider} from "@/features/context/AuthContext";

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
       <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    );
}
