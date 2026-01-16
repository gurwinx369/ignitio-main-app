"use client"
import React, { useState, useEffect } from 'react';

// Pseudo code for MongoDB/Mongoose integration:
/*
// models/OnboardingData.js
const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learningFields: [{ type: String }],
  projectDescription: { type: String },
  completedAt: { type: Date, default: Date.now }
});

const OnboardingData = mongoose.model('OnboardingData', onboardingSchema);
module.exports = OnboardingData;

// API Route (Next.js): /api/onboarding/save
export async function POST(req) {
  const { userId, learningFields, projectDescription } = await req.json();

  const onboardingData = new OnboardingData({
    userId,
    learningFields,
    projectDescription
  });

  await onboardingData.save();
  return Response.json({ success: true, data: onboardingData });
}

// In component:
const saveToDatabase = async (data) => {
  const response = await fetch('/api/onboarding/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
*/

const learningOptions = [
    'Ui/Ux',
    'backend development',
    'Gen Ai',
    'frontend development',
    'Ai/ML',
    'Others',
    'cloud computing',
    'Cybersecurity'
];

export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFields, setSelectedFields] = useState([]);
    const [projectDescription, setProjectDescription] = useState('');
    const [progressWidth, setProgressWidth] = useState(50);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('onboarding_progress');
        if (saved) {
            const data = JSON.parse(saved);
            setCurrentStep(data.currentStep || 1);
            setSelectedFields(data.selectedFields || []);
            setProjectDescription(data.projectDescription || '');
            setProgressWidth(data.currentStep === 1 ? 50 : 100);
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        const data = {
            currentStep,
            selectedFields,
            projectDescription
        };
        localStorage.setItem('onboarding_progress', JSON.stringify(data));
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
            setProgressWidth(prev => {
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
            setSelectedFields(selectedFields.filter(f => f !== field));
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
        handleComplete();
    };

    const handleComplete = async () => {
        const finalData = {
            learningFields: selectedFields,
            projectDescription: projectDescription.trim()
        };

        // Save to localStorage
        localStorage.setItem('onboarding_completed', JSON.stringify(finalData));

        // Pseudo call to save to database
        // await saveToDatabase({ userId: currentUser.id, ...finalData });

        console.log('Onboarding completed:', finalData);
        alert('Onboarding completed! Check console for saved data.');
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
        
        .chip {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .chip:active {
          transform: scale(0.95);
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>

            <div
                className="min-h-screen flex items-center justify-center p-6"
                style={{ backgroundColor: '#F5EFE7' }}
            >
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-12 slide-in">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-8 rounded-full overflow-hidden" style={{ backgroundColor: '#E0E0E0' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-800 ease-out"
                                    style={{
                                        width: `${progressWidth}%`,
                                        backgroundColor: '#F4B63C',
                                        boxShadow: '0 2px 8px rgba(244, 182, 60, 0.4)'
                                    }}
                                />
                            </div>
                            <span
                                className="text-lg font-medium whitespace-nowrap"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#666'
                                }}
                            >
                {currentStep} out of 2
              </span>
                        </div>
                    </div>

                    {/* Step 1: Learning Fields */}
                    {currentStep === 1 && (
                        <div className="slide-in">
                            <h1
                                className="text-5xl font-bold mb-3"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#1a1a2e'
                                }}
                            >
                                What you wanted to learn??
                            </h1>
                            <p
                                className="text-xl mb-12"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#666'
                                }}
                            >
                                you can select 2 to 3 fields
                            </p>

                            <div className="flex flex-wrap gap-4 mb-16">
                                {learningOptions.map((option, index) => (
                                    <button
                                        key={option}
                                        onClick={() => toggleField(option)}
                                        disabled={!selectedFields.includes(option) && selectedFields.length >= 3}
                                        className="chip px-8 py-4 rounded-full text-lg font-medium"
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            backgroundColor: selectedFields.includes(option) ? '#00A9FF' : '#FFFFFF',
                                            color: selectedFields.includes(option) ? '#FFFFFF' : '#333',
                                            border: selectedFields.includes(option) ? '2px solid #00A9FF' : '2px solid #D4D4D4',
                                            cursor: !selectedFields.includes(option) && selectedFields.length >= 3 ? 'not-allowed' : 'pointer',
                                            opacity: !selectedFields.includes(option) && selectedFields.length >= 3 ? 0.5 : 1,
                                            animationDelay: `${index * 0.05}s`
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
                                    backgroundColor: selectedFields.length >= 2 ? '#00A9FF' : '#A0D2E8',
                                    cursor: selectedFields.length >= 2 ? 'pointer' : 'not-allowed',
                                    boxShadow: selectedFields.length >= 2 ? '0 6px 0 #0088CC' : '0 6px 0 #7FB8D4',
                                    transform: 'translateY(0)'
                                }}
                                onMouseDown={(e) => {
                                    if (selectedFields.length >= 2) {
                                        e.currentTarget.style.transform = 'translateY(6px)';
                                        e.currentTarget.style.boxShadow = '0 0px 0 #0088CC';
                                    }
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = selectedFields.length >= 2 ? '0 6px 0 #0088CC' : '0 6px 0 #7FB8D4';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = selectedFields.length >= 2 ? '0 6px 0 #0088CC' : '0 6px 0 #7FB8D4';
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
                                    color: '#1a1a2e'
                                }}
                            >
                                What you wanted to build?
                            </h1>
                            <p
                                className="text-lg mb-12 leading-relaxed"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#666'
                                }}
                            >
                                simply working on a project while learning
                                can improve retention rates by 45% more
                            </p>

                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Describe your project in few words..."
                                className="w-full h-64 p-6 rounded-3xl text-lg outline-none transition-all duration-200 resize-none mb-8"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    backgroundColor: '#FFFFFF',
                                    border: '2px solid #D4D4D4',
                                    color: '#333'
                                }}
                                onFocus={(e) => e.target.style.border = '2px solid #00A9FF'}
                                onBlur={(e) => e.target.style.border = '2px solid #D4D4D4'}
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSkip}
                                    className="px-12 py-5 rounded-full text-xl font-bold uppercase tracking-wider transition-all duration-200"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        backgroundColor: '#A0C4E8',
                                        color: '#1a1a2e',
                                        boxShadow: '0 6px 0 #7FA8CC'
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(6px)';
                                        e.currentTarget.style.boxShadow = '0 0px 0 #7FA8CC';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 0 #7FA8CC';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 0 #7FA8CC';
                                    }}
                                >
                                    SKIP
                                </button>

                                <button
                                    onClick={handleComplete}
                                    className="flex-1 py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-200"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        backgroundColor: '#00A9FF',
                                        boxShadow: '0 6px 0 #0088CC'
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(6px)';
                                        e.currentTarget.style.boxShadow = '0 0px 0 #0088CC';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 0 #0088CC';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 0 #0088CC';
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
