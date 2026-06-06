// app/context/AuthContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase/firebase";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set persistence to LOCAL
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                console.log("Auth persistence set to LOCAL");
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // console.log("Auth state changed:", user ? user.email : "No user");
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = async (email, password) => {
        try {
            console.log("Attempting signup with email:", email);
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log("Signup successful:", result.user.email);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Signup error:", error.code, error.message);
            let errorMessage = "Failed to create account";

            if (error.code === "auth/email-already-in-use") {
                errorMessage = "Email already in use";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            }

            return { success: false, error: errorMessage };
        }
    };

    const login = async (email, password) => {
        try {
            console.log("Attempting login with email:", email);
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful:", result.user.email);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Login error:", error.code, error.message);
            let errorMessage = "Failed to login";

            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address";
            } else if (error.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later";
            }

            return { success: false, error: errorMessage };
        }
    };

    const loginWithGoogle = async () => {
        try {
            console.log("Attempting Google login");

            // Configure Google provider with custom parameters
            googleProvider.setCustomParameters({
                prompt: "select_account",
            });

            // Use signInWithPopup with proper error handling
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google login successful:", result.user.email);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Google login error:", error.code, error.message);
            let errorMessage = "Failed to sign in with Google";

            // Handle the case where popup was cancelled by another popup request
            if (error.code === "auth/cancelled-popup-request") {
                console.log("Popup request was cancelled by a new request");
                // Don't show error for cancelled requests, just return null
                return { success: false, error: null };
            } else if (error.code === "auth/popup-closed-by-user") {
                errorMessage = "Sign-in cancelled";
            } else if (error.code === "auth/popup-blocked") {
                errorMessage = "Popup blocked. Please allow popups for this site";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/unauthorized-domain") {
                errorMessage = "This domain is not authorized for OAuth operations";
            } else if (error.code === "auth/internal-error") {
                errorMessage = "Authentication error. Please try again";
            }

            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            console.log("Attempting logout");
            await signOut(auth);
            console.log("Logout successful");
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
