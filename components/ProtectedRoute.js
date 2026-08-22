// app/components/ProtectedRoute.js
"use client";
import { useAuth } from "@/features/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Loader from "@/layout/Loader";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/signup");
        }
    }, [user, loading, router]);

    // Show Ignitio Brand Loader
    if (loading) {
        return <Loader />;
    }

    // Show nothing while redirecting
    if (!user) {
        return null;
    }

    // User is authenticated, show the home content
    return <>{children}</>;
}
