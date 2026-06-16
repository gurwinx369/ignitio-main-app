import React, { useState, useEffect, useRef } from 'react';
import { Bot, CheckCircle, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/features/context/AuthContext';

function normalizeAnswer(value) {
    return String(value || "").trim().toUpperCase().charAt(0);
}

const KyleQuizModal = ({ open, level, roadmapType, dayNumber, role: propRole, onAnswered, onCloseAfterAnswered }) => {
    const { user } = useAuth();
    
    // States
    const [status, setStatus] = useState('loading'); // loading, error, ready, submitting, result, already-attempted
    const [quiz, setQuiz] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [retryNonce, setRetryNonce] = useState(0);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (!open) return;
        
        // Prevent double fetching due to strict mode or remounts
        if (hasFetched.current && quiz) {
            return;
        }
        
        const fetchQuiz = async () => {
            hasFetched.current = true;
            setStatus('loading');
            
            try {
                if (!user) throw new Error("Please sign in again to continue.");
                const idToken = await user.getIdToken();
                
                const allowedRoles = ["student", "developer", "writer", "designer", "other"];
                const localRole = typeof window !== 'undefined' ? localStorage.getItem("profession") : null;
                let normalizedRole = propRole || localRole || "other";
                normalizedRole = normalizedRole.toLowerCase();
                if (!allowedRoles.includes(normalizedRole)) {
                    normalizedRole = "other";
                }

                const response = await fetch('/api/v2/kyle/quiz/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        concept: level.concept || level.title || level.name,
                        transcript: level.transcript || level.description,
                        role: normalizedRole
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate quiz');
                }
                
                setQuiz(data.data);
                setStatus('ready');
            } catch (err) {
                console.error("Quiz generate error:", err);
                setErrorMsg(err.message || "Kyle could not prepare the quiz right now. Please try again.");
                setStatus('error');
            }
        };

        fetchQuiz();
    }, [open, user, level, propRole, quiz, retryNonce]);

    const handleSubmit = async () => {
        if (!selectedOption || !quiz) return;
        
        setStatus('submitting');
        const correctKey = normalizeAnswer(quiz.correctAnswer);
        const selectedKey = normalizeAnswer(selectedOption);
        const wasCorrect = selectedKey === correctKey;
        
        setIsCorrect(wasCorrect);

        if (typeof window !== 'undefined') {
            if (wasCorrect) {
                window.dispatchEvent(new CustomEvent('kyle-pet-state', { detail: { state: 'celebrating', duration: 3000 } }));
            } else {
                window.dispatchEvent(new CustomEvent('kyle-pet-state', { detail: { state: 'thinking', duration: 2000 } }));
            }
        }

        try {
            if (!user) throw new Error("Please sign in again to continue.");
            const idToken = await user.getIdToken();

            const response = await fetch('/api/v2/kyle/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    levelId: level.id,
                    dayNumber: dayNumber,
                    concept: level.concept || level.title || level.name,
                    question: quiz.question,
                    selectedOption: selectedKey,
                    wasCorrect: wasCorrect
                })
            });

            const data = await response.json();
            
            if (response.status === 429) {
                setStatus('already-attempted');
                onAnswered({ alreadyAttempted: true });
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quiz');
            }

            setStatus('result');
            onAnswered({ wasCorrect });
        } catch (err) {
            console.error("Quiz submit error:", err);
            setErrorMsg(err.message || "Failed to submit quiz.");
            setStatus('error'); // Let them retry submit or bypass
        }
    };
    
    const handleRetry = () => {
        setErrorMsg(null);
        setQuiz(null);
        setSelectedOption(null);
        setIsCorrect(null);
        hasFetched.current = false;
        setRetryNonce(prev => prev + 1);
        setStatus('loading'); // Re-trigger effect
    };

    const handleBypass = () => {
        sessionStorage.setItem(`quiz_gate_bypassed_${roadmapType}_${level.id}`, "true");
        onCloseAfterAnswered();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-orange-50 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Knowledge Check</h3>
                        <p className="text-sm text-gray-500">Alright. Let's see if you were actually watching.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[70vh]">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-gray-600 font-medium">Kyle is preparing your checkpoint...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-gray-800 font-medium">{errorMsg}</p>
                            <div className="flex flex-col gap-3 w-full mt-4">
                                <button 
                                    onClick={handleRetry}
                                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={18} /> Try Again
                                </button>
                                <button 
                                    onClick={handleBypass}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors"
                                >
                                    Continue without quiz for now
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'already-attempted' && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <CheckCircle className="w-16 h-16 text-blue-500" />
                            <h4 className="text-xl font-bold text-gray-900">Already Answered</h4>
                            <p className="text-gray-600">You already answered this quiz. You can continue the lesson.</p>
                            <button 
                                onClick={onCloseAfterAnswered}
                                className="w-full mt-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-95"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {(status === 'ready' || status === 'submitting') && quiz && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 leading-snug">
                                {quiz.question}
                            </h4>
                            <div className="space-y-3">
                                {Object.entries(quiz.options).map(([key, text]) => (
                                    <button
                                        key={key}
                                        onClick={() => status !== 'submitting' && setSelectedOption(key)}
                                        disabled={status === 'submitting'}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                            selectedOption === key
                                                ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold mt-0.5 ${
                                                selectedOption === key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {key}
                                            </span>
                                            <span className="leading-relaxed font-medium">
                                                {text}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedOption || status === 'submitting'}
                                className="w-full mt-2 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Submit Answer'}
                            </button>
                        </div>
                    )}

                    {status === 'result' && quiz && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col items-center text-center space-y-3">
                                {isCorrect ? (
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <XCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                )}
                                <h4 className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {isCorrect ? 'Correct!' : 'Not quite'}
                                </h4>
                            </div>

                            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                                <h5 className="font-bold text-gray-800 mb-2">Explanation</h5>
                                <p className="text-gray-600 leading-relaxed">
                                    {quiz.explanation}
                                </p>
                            </div>

                            <button
                                onClick={onCloseAfterAnswered}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
                            >
                                Continue to lesson
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KyleQuizModal;
