"use client";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import {useAuth} from "@/features/context/AuthContext";

// function to send the selected fields, project idea, username and email except the badge

const saveToDatabase = async (data) => {
    try {
        // Validate required fields
        if (!data.email || !data.firebaseUID) {
            throw new Error("Email and Firebase UID are required");
        }

        if (!data.selectedTechField || data.selectedTechField.length < 2) {
            throw new Error("At least 2 learning fields must be selected");
        }
        //console.log(Selected tech fields: data?.selectedTechField);
        // Prepare payload
        const payload = {
                email: data?.email || "email not found",
                firebaseUID: data?.firebaseUID || "UID not found",
                questions: {
                    selectedTechField: data?.selectedTechField,
                    selectedProject: data?.projectDescription || "", // Empty string if skipped
                },
                roadmaps: {
                    name: "Git and Github" //for mvp only in next version it should be selected by the user to choose between the roadmaps
                },
                badge:
                    data?.badge || {
                        name: "Beginner",
                        badgeUrl: "default badge"
                    }
            }
        ;

        // Make API call
        const response = await axios.post("/api/v1/user", payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 10000, // 10 second timeout
        });

        console.log("Data saved successfully:", response.data);
        return response.data;

    } catch (err) {
        // Enhanced error handling
        if (err.response) {
            // Server responded with error status
            console.error("Server Error:", err.response.status, err.response.data);
            throw new Error(
                err.response.data?.message ||
                `Server error: ${err.response.status}`
            );
        } else if (err.request) {
            // Request made but no response received
            console.error("Network Error: No response from server");
            throw new Error("Network error. Please check your connection.");
        } else {
            // Error in request setup or validation
            console.error("Error:", err.message);
            throw new Error(err.message);
        }
    }
};
const learningOptions = [
    "Ui/Ux",
    "backend development",
    "Gen Ai",
    "frontend development",
    "Ai/ML",
    "Others",
    "cloud computing",
    "Cybersecurity",
];

export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFields, setSelectedFields] = useState([]);
    const [projectDescription, setProjectDescription] = useState("");
    const [progressWidth, setProgressWidth] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    //accessing user info from the context provider
    const {user} = useAuth();
    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("onboarding_progress");
        if (saved) {
            const data = JSON.parse(saved);
            setCurrentStep(data.currentStep || 1);
            setSelectedFields(data.selectedFields || []);
            setProjectDescription(data.projectDescription || "");
            setProgressWidth(data.currentStep === 1 ? 50 : 100);
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        const data = {
            currentStep,
            selectedFields,
            projectDescription,
        };
        localStorage.setItem("onboarding_progress", JSON.stringify(data));
    }, [currentStep, selectedFields, projectDescription]);

    // Animate progress bar
    useEffect(() => {
        const targetWidth = currentStep === 1 ? 50 : 100;
        const duration = 800;
        const steps = 60;
        const increment = (targetWidth - progressWidth) / steps;
        let current = 0;

        const timer = setInterval(() => {
            current++;
            setProgressWidth((prev) => {
                const newWidth = prev + increment;
                if (current >= steps) {
                    clearInterval(timer);
                    return targetWidth;
                }
                return newWidth;
            });
        }, duration / steps);

        return () => clearInterval(timer);
    }, [currentStep, progressWidth]);

    const toggleField = (field) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter((f) => f !== field));
        } else {
            if (selectedFields.length < 3) {
                setSelectedFields([...selectedFields, field]);
            }
        }
    };

    const handleContinueStep1 = () => {
        if (selectedFields.length >= 2) {
            setCurrentStep(2);
        }
    };
    const handleSkip = () => {
        handleComplete()
    };

    const handleComplete = async () => {
        try {
            setIsLoading(true);

            const finalData = {
                selectedTechField: selectedFields,
                selectedProject: projectDescription.trim(),
            };

            // Access email and uid from the user object
            const {uid, email} = user;

            // Optional: Add badge data (you might get this from context or state)
            const badge = {
                name: "Onboarding Complete",
                badgeUrl: "/badges/onboarding-badge.png"
            };

            // Call saveToDatabase with proper error handling
            const result = await saveToDatabase({
                firebaseUID: uid,
                email: email,
                selectedTechField: selectedFields,
                selectedProject: projectDescription.trim(),
                badge
            });

            // Save to localStorage only after successful DB save
            localStorage.setItem("onboarding_completed", JSON.stringify(finalData));
            // Navigate to welcome page
            router.push("/home/onboarding/welcome");

        } catch (error) {
            // Handle errors gracefully
            console.error("Failed to complete onboarding:", error);

            // Show user-friendly error message
            alert(`Failed to save your progress: ${error.message}. Please try again.`);

        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .chip {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .chip:active {
          transform: scale(0.95);
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .loading-dot {
          animation: bounce 1.4s ease-in-out infinite;
        }
        
        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>

            <div
                className="min-h-screen flex items-center justify-center p-6"
                style={{ backgroundColor: "#F5EFE7" }}
            >
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-12 slide-in">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex-1 h-8 rounded-full overflow-hidden"
                                style={{ backgroundColor: "#E0E0E0" }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-800 ease-out"
                                    style={{
                                        width: `${progressWidth}%`,
                                        backgroundColor: "#F4B63C",
                                        boxShadow:
                                            "0 2px 8px rgba(244, 182, 60, 0.4)",
                                    }}
                                />
                            </div>
                            <span
                                className="text-lg font-medium whitespace-nowrap"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#666",
                                }}
                            >
                                {currentStep} out of 2
                            </span>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{
                                backgroundColor: "rgba(245, 239, 231, 0.95)",
                                animation: "fadeIn 0.3s ease-out"
                            }}
                        >
                            <div
                                className="p-12 rounded-3xl text-center"
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                                    border: "2px solid #E0E0E0"
                                }}
                            >
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="spinner"
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            border: "4px solid #E0E0E0",
                                            borderTop: "4px solid #00A9FF",
                                            borderRadius: "50%"
                                        }}
                                    />
                                </div>
                                <h2
                                    className="text-2xl font-bold mb-3"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        color: "#1a1a2e"
                                    }}
                                >
                                    Saving your progress
                                </h2>
                                <div className="flex items-center justify-center gap-2">
                                    <div
                                        className="loading-dot"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: "#00A9FF"
                                        }}
                                    />
                                    <div
                                        className="loading-dot"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: "#00A9FF"
                                        }}
                                    />
                                    <div
                                        className="loading-dot"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: "#00A9FF"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Learning Fields */}
                    {currentStep === 1 && (
                        <div className="slide-in">
                            <h1
                                className="text-5xl font-bold mb-3"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#1a1a2e",
                                }}
                            >
                                What you wanted to learn??
                            </h1>
                            <p
                                className="text-xl mb-12"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#666",
                                }}
                            >
                                you can select 2 to 3 fields
                            </p>

                            <div className="flex flex-wrap gap-4 mb-16">
                                {learningOptions.map((option, index) => (
                                    <button
                                        key={option}
                                        onClick={() => toggleField(option)}
                                        disabled={
                                            !selectedFields.includes(option) &&
                                            selectedFields.length >= 3
                                        }
                                        className="chip px-8 py-4 rounded-full text-lg font-medium"
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            backgroundColor:
                                                selectedFields.includes(option)
                                                    ? "#00A9FF"
                                                    : "#FFFFFF",
                                            color: selectedFields.includes(
                                                option,
                                            )
                                                ? "#FFFFFF"
                                                : "#333",
                                            border: selectedFields.includes(
                                                option,
                                            )
                                                ? "2px solid #00A9FF"
                                                : "2px solid #D4D4D4",
                                            cursor:
                                                !selectedFields.includes(
                                                    option,
                                                ) && selectedFields.length >= 3
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                !selectedFields.includes(
                                                    option,
                                                ) && selectedFields.length >= 3
                                                    ? 0.5
                                                    : 1,
                                            animationDelay: `${index * 0.05}s`,
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleContinueStep1}
                                disabled={selectedFields.length < 2}
                                className="w-full py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-200"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    backgroundColor:
                                        selectedFields.length >= 2
                                            ? "#00A9FF"
                                            : "#A0D2E8",
                                    cursor:
                                        selectedFields.length >= 2
                                            ? "pointer"
                                            : "not-allowed",
                                    boxShadow:
                                        selectedFields.length >= 2
                                            ? "0 6px 0 #0088CC"
                                            : "0 6px 0 #7FB8D4",
                                    transform: "translateY(0)",
                                }}
                                onMouseDown={(e) => {
                                    if (selectedFields.length >= 2) {
                                        e.currentTarget.style.transform =
                                            "translateY(6px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 0px 0 #0088CC";
                                    }
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        selectedFields.length >= 2
                                            ? "0 6px 0 #0088CC"
                                            : "0 6px 0 #7FB8D4";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        selectedFields.length >= 2
                                            ? "0 6px 0 #0088CC"
                                            : "0 6px 0 #7FB8D4";
                                }}
                            >
                                CONTINUE
                            </button>
                        </div>
                    )}

                    {/* Step 2: Project Description */}
                    {currentStep === 2 && (
                        <div className="slide-in">
                            <h1
                                className="text-5xl font-bold mb-3"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#1a1a2e",
                                }}
                            >
                                What you wanted to build?
                            </h1>
                            <p
                                className="text-lg mb-12 leading-relaxed"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#666",
                                }}
                            >
                                simply working on a project while learning can
                                improve retention rates by 45% more
                            </p>

                            <textarea
                                value={projectDescription}
                                onChange={(e) =>
                                    setProjectDescription(e.target.value)
                                }
                                placeholder="Describe your project in few words..."
                                className="w-full h-64 p-6 rounded-3xl text-lg outline-none transition-all duration-200 resize-none mb-8"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    backgroundColor: "#FFFFFF",
                                    border: "2px solid #D4D4D4",
                                    color: "#333",
                                }}
                                onFocus={(e) =>
                                    (e.target.style.border =
                                        "2px solid #00A9FF")
                                }
                                onBlur={(e) =>
                                    (e.target.style.border =
                                        "2px solid #D4D4D4")
                                }
                                disabled={isLoading}
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSkip}
                                    disabled={isLoading}
                                    className="px-12 py-5 rounded-full text-xl font-bold uppercase tracking-wider transition-all duration-200"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        backgroundColor: isLoading ? "#D4D4D4" : "#A0C4E8",
                                        color: "#1a1a2e",
                                        boxShadow: isLoading ? "0 6px 0 #B8B8B8" : "0 6px 0 #7FA8CC",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        opacity: isLoading ? 0.6 : 1
                                    }}
                                    onMouseDown={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(6px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 0px 0 #7FA8CC";
                                        }
                                    }}
                                    onMouseUp={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 0 #7FA8CC";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 0 #7FA8CC";
                                        }
                                    }}
                                >
                                    SKIP
                                </button>

                                <button
                                    onClick={handleComplete}
                                    disabled={isLoading}
                                    className="flex-1 py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-200"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        backgroundColor: isLoading ? "#A0D2E8" : "#00A9FF",
                                        boxShadow: isLoading ? "0 6px 0 #7FB8D4" : "0 6px 0 #0088CC",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        opacity: isLoading ? 0.6 : 1
                                    }}
                                    onMouseDown={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(6px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 0px 0 #0088CC";
                                        }
                                    }}
                                    onMouseUp={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 0 #0088CC";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 0 #0088CC";
                                        }
                                    }}
                                >
                                    CONTINUE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
