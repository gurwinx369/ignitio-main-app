'use client';
import { useFeatureFlagVariantKey } from 'posthog-js/react';
import { useAuth } from '@/features/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Loader from '@/layout/Loader';

export default function RootPage() {
    const variant = useFeatureFlagVariantKey('conversion-flow');
    const { user, loading } = useAuth();
    const router = useRouter();
    const fallbackRef = useRef(null);

    useEffect(() => {
        if (loading) return;

        // Authenticated users always go home — variant irrelevant
        if (user) {
            router.replace('/home');
            return;
        }

        if (variant === 'onboarding-new-flow') {
            router.replace('/preview/onboarding');
            return;
        }

        if (variant !== undefined) {
            // Flag loaded, not new-flow → old auth-first flow
            router.replace('/home');
            return;
        }

        // variant is still undefined = PostHog decide hasn't responded yet.
        // Fallback: redirect to old flow after 1.5s so the page never gets stuck.
        fallbackRef.current = setTimeout(() => router.replace('/home'), 1500);
        return () => clearTimeout(fallbackRef.current);
    }, [variant, user, loading, router]);

    return <Loader />;
}
