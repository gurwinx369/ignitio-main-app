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
    getAdditionalUserInfo,
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

    const clearTargetedStorage = () => {
        try {
            const prefixes = [
                "profession", "completedLevels", "completed_levels_", "progress_",
                "assignment_passed_", "quiz_gate_completed_", "quiz_gate_bypassed_",
                "video_timer_", "segment_watch_", "segment_intervals_", "ignitio:last_active_roadmap"
            ];
            
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && prefixes.some(p => key.startsWith(p))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            
            const sessionKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith("quiz_gate_bypassed_")) {
                    sessionKeysToRemove.push(key);
                }
            }
            sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    };

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

            if (user) {
                const storedUid = localStorage.getItem("ignitio:active_uid");
                if (storedUid && storedUid !== user.uid) {
                    clearTargetedStorage();
                    localStorage.setItem("ignitio:active_uid", user.uid);
                } else if (!storedUid) {
                    localStorage.setItem("ignitio:active_uid", user.uid);
                }
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

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (process.env.NODE_ENV === "development") {
                console.log("Signup successful");
            }
            
            clearTargetedStorage();
            localStorage.setItem("ignitio:active_uid", result.user.uid);
            
            return { success: true, user: result.user, authMode: "new_signup" };
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                try {
                    if (process.env.NODE_ENV === "development") {
                        console.info("Signup: Email already in use, attempting login fallback...");
                        console.log("Fallback login successful");
                    }
                    return { success: true, user: loginResult.user, authMode: "existing_login" };
                } catch (loginError) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Fallback login error:", loginError?.code, loginError?.message);
                    }
                    return { success: false, error: "Check your email or password." };
                }
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Signup error:", error?.code, error?.message);
            }

            let errorMessage = "Check your email or password.";

            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later";
            }

            return { success: false, error: errorMessage };
        }
    };

    const login = async (email, password) => {
        try {

            const result = await signInWithEmailAndPassword(auth, email, password);
            if (process.env.NODE_ENV === "development") {
                console.log("Login successful");
            }
            return { success: true, user: result.user };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Login error:", error?.code, error?.message);
            }
            let errorMessage = "Check your email or password.";

            if (error.code === "auth/invalid-email") {
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
            if (process.env.NODE_ENV === "development") {
                console.log("Attempting Google login");
            }

            // Configure Google provider with custom parameters
            googleProvider.setCustomParameters({
                prompt: "select_account",
            });

            // Use signInWithPopup with proper error handling
            const result = await signInWithPopup(auth, googleProvider);
            if (process.env.NODE_ENV === "development") {
                console.log("Google login successful");
            }
            
            const additionalUserInfo = getAdditionalUserInfo(result);
            const authMode = additionalUserInfo?.isNewUser ? "new_signup" : "existing_login";

            if (authMode === "new_signup") {
                clearTargetedStorage();
                localStorage.setItem("ignitio:active_uid", result.user.uid);
            }

            return { success: true, user: result.user, authMode };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Google login error:", error?.code, error?.message);
            }
            let errorMessage = "Failed to sign in with Google";

            // Handle the case where popup was cancelled by another popup request
            if (error.code === "auth/cancelled-popup-request") {
                if (process.env.NODE_ENV === "development") {
                    console.log("Popup request was cancelled by a new request");
                }
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
            if (process.env.NODE_ENV === "development") {
                console.log("Attempting logout");
            }
            await signOut(auth);
            if (process.env.NODE_ENV === "development") {
                console.log("Logout successful");
            }
            return { success: true };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Logout error:", error?.message || "unknown error");
            }
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
