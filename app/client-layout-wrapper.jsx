'use client';

import { AuthProvider } from "@/features/context/AuthContext";
import { PostHogProvider } from './providers';

export default function ClientLayoutWrapper({ children, bodyClass }) {

    return (
        <body className={bodyClass}>
            <AuthProvider>
                <PostHogProvider>{children}</PostHogProvider>
            </AuthProvider>
        </body>
    );
}
