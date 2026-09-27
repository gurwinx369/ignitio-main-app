import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/context/AuthContext';

function normalizeAnswer(value) {
    return String(value || "").trim().toUpperCase().charAt(0);
}

const KyleQuizModal = ({ open, level, roadmapType, dayNumber, role: propRole, gateType, onAnswered, onCloseAfterAnswered }) => {
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
        
        // Prevent double fetching due to strict mode or concurrent re-renders.
        // We only check hasFetched.current so we don't fire a second request while the first is pending.
        if (hasFetched.current) {
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

                // Gate-specific focus: enrich concept so the LLM generates a distinct question per gate.
                // 50% gate → basic recall/definition (what is X, what does Y mean)
                // 80% gate → applied understanding (how/why/what-if, deeper synthesis)
                const baseConcept = level.concept || level.title || level.name;
                const enrichedConcept = gateType === '50'
                    ? `${baseConcept} [Focus: ask a basic recall or definition question about this topic]`
                    : gateType === '80'
                        ? `${baseConcept} [Focus: ask an applied or synthesis question — how, why, or what would happen if]`
                        : baseConcept;

                const response = await fetch('/api/v2/kyle/quiz/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        concept: enrichedConcept,
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
                    gateType: gateType || "50", // pass gateType so backend knows which quiz this is
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
        // Use gate-specific bypass key so bypassing one gate doesn't affect the other
        const bypassKey = gateType
            ? `quiz_gate_${gateType}_bypassed_${roadmapType}_${level.id}`
            : `quiz_gate_bypassed_${roadmapType}_${level.id}`; // fallback safety
        sessionStorage.setItem(bypassKey, "true");
        onCloseAfterAnswered();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <div className="bg-[#fffaf3] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b-2 border-[#e5d5c5]/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#e5d5c5] shadow-sm">
                        <Image
                            src="/kyle/kyle.svg"
                            alt="Kyle"
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-[20px] font-extrabold text-[#19183b] tracking-tight">Knowledge Check</h3>
                        <p className="text-[#7775a5] font-semibold text-sm">
                            {gateType === '50'
                                ? "You're halfway through — let's check in!"
                                : gateType === '80'
                                    ? "Almost done — one last checkpoint!"
                                    : "Let's see if you were paying attention."}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[70vh]">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <p className="text-gray-500 font-medium tracking-tight">Kyle is preparing your checkpoint...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-gray-800 font-medium">{errorMsg}</p>
                            <div className="flex flex-col gap-3 w-full mt-4">
                                <button 
                                    onClick={handleRetry}
                                    className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={18} /> Try Again
                                </button>
                                <button 
                                    onClick={handleBypass}
                                    className="btn-push-sm w-full py-3.5 rounded-2xl text-[#4A5568] font-bold text-[15px] uppercase tracking-wide bg-white border-[#e8e8f0] hover:text-[#001D32]"
                                >
                                    Continue without quiz for now
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'already-attempted' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 px-6">
                            <CheckCircle className="w-16 h-16 text-[#10b981]" />
                            <h4 className="text-2xl font-extrabold text-[#19183b]">Already Answered</h4>
                            <p className="text-[#7775a5] font-medium text-[15px]">You already answered this quiz. You can continue the lesson.</p>
                            <button 
                                onClick={onCloseAfterAnswered}
                                className="btn-push w-full mt-4 py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6]"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {(status === 'ready' || status === 'submitting') && quiz && (
                        <div className="space-y-6 px-6 pt-2 pb-6">
                            <h4 className="text-[20px] font-extrabold text-[#19183b] tracking-tight leading-snug">
                                {quiz.question}
                            </h4>
                            <div className="flex flex-col gap-3">
                                {Object.entries(quiz.options).map(([key, text]) => {
                                    const isSelected = selectedOption === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => status !== 'submitting' && setSelectedOption(key)}
                                            disabled={status === 'submitting'}
                                            className={[
                                                "w-full text-left px-5 py-4 rounded-2xl border-2 cursor-pointer select-none font-semibold text-[15px] leading-snug",
                                                "transition-[border-color,background-color,box-shadow,transform] duration-100",
                                                isSelected
                                                    ? "active:translate-y-[3px] active:shadow-none"
                                                    : "active:translate-y-[3px] active:shadow-none",
                                                isSelected
                                                    ? "border-[#00a9ff] bg-[#ddf2ff] text-[#001d32] shadow-[0_3px_0_#3081AD]"
                                                    : "border-[#e5d5c5] bg-white text-[#1a2a3a] shadow-[0_3px_0_#FFDCBC]",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold mt-0.5 border ${
                                                    isSelected ? 'bg-[#00a9ff] text-white border-[#007bcc]' : 'bg-[#fcf5ee] text-[#7775a5] border-[#e5d5c5]'
                                                }`}>
                                                    {key}
                                                </span>
                                                <span className={`leading-relaxed ${isSelected ? 'text-[#001d32]' : ''}`}>
                                                    {text}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedOption || status === 'submitting'}
                                className="btn-push w-full mt-2 py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Answer'}
                            </button>
                        </div>
                    )}

                    {status === 'result' && quiz && (
                        <div className="space-y-6 px-6 pt-2 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    {isCorrect ? (
                                        <CheckCircle className="w-10 h-10 text-[#10b981]" />
                                    ) : (
                                        <XCircle className="w-10 h-10 text-[#ef4444]" />
                                    )}
                                    <h4 className="text-3xl font-extrabold text-[#19183b] tracking-tight">
                                        {isCorrect ? 'Correct!' : 'Not quite'}
                                    </h4>
                                </div>
                                <div className="bg-white border-2 border-[#e5d5c5] p-5 rounded-2xl shadow-[0_3px_0_#FFDCBC]">
                                    <p className="text-[#1a2a3a] leading-relaxed font-semibold text-[15px]">
                                        {quiz.explanation}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onCloseAfterAnswered}
                                className="btn-push w-full mt-4 py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6]"
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
