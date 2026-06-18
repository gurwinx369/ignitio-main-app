'use client';

import { useEffect, useState } from 'react';
import Loader from '@/layout/Loader';
import { AuthProvider } from "@/features/context/AuthContext";
import { PostHogProvider } from './providers';

export default function ClientLayoutWrapper({ children, bodyClass }) {
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
        <body className={bodyClass}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <AuthProvider>
                        <PostHogProvider>{children}</PostHogProvider>
                    </AuthProvider>
                </>
            )}
        </body>
    );
}
