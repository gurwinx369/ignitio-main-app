// app/components/ProtectedRoute.js
"use client";
import { useAuth } from "@/features/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/signup");
        }
    }, [user, loading, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (!user) {
        return null;
    }

    // User is authenticated, show the home content
    return <>{children}</>;
}
