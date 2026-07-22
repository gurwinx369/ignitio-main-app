import React, { useState, useEffect, useRef } from 'react';
import { Bot, CheckCircle, XCircle, AlertCircle, RefreshCcw, Lock, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '@/features/context/AuthContext';
import { useRouter } from 'next/navigation';

function normalizeRole(role) {
    const allowedRoles = ["student", "developer", "writer", "designer", "other"];
    const localRole = typeof window !== 'undefined' ? localStorage.getItem("profession") : null;
    let normalized = role || localRole || "other";
    normalized = String(normalized).trim().toLowerCase();
    if (!allowedRoles.includes(normalized)) {
        normalized = "other";
    }
    return normalized;
}

const KyleAssignmentModal = ({ open, roadmapId, roadmapType, dayId, dayNumber, levels, role, isFinalDay, onPassed, onClose }) => {
    const { user } = useAuth();
    const router = useRouter();
    
    // States
    const [status, setStatus] = useState('loading'); // loading, ready, scoring, result_pass, result_fail, error, already-passed, cooldown
    const [assignmentPrompt, setAssignmentPrompt] = useState("");
    const [userResponse, setUserResponse] = useState("");
    const [scoreData, setScoreData] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [retryNonce, setRetryNonce] = useState(0);

    const hasFetched = useRef(false);
    // Server-equivalent pass thresholds: Day 1 → 5, Day 2 → 6, Day 3+ → 7.
    // This must stay in sync with FastAPI's scoring logic so the displayed
    // required score never contradicts the authoritative API-returned `passed`.
    const requiredScore = dayNumber === 1 ? 5 : dayNumber === 2 ? 6 : 7;

    useEffect(() => {
        if (!open) {
            setStatus('loading');
            setAssignmentPrompt("");
            setUserResponse("");
            setScoreData(null);
            setErrorMsg(null);
            setLockedUntil(null);
            hasFetched.current = false;
        }
    }, [open, roadmapId, dayId]);

    
    const formattedLevels = levels.map(l => ({
        concept: l.concept || l.title || l.name || "Concept",
        transcript: l.transcript || l.description || "Transcript"
    }));

    useEffect(() => {
        if (!open) return;
        if (hasFetched.current && assignmentPrompt) return;
        
        const generateAssignment = async () => {
            hasFetched.current = true;
            setStatus('loading');
            
            try {
                if (!user) throw new Error("Please sign in again to continue.");
                const idToken = await user.getIdToken();
                const normalizedRole = normalizeRole(role);

                const response = await fetch('/api/v2/kyle/assignment/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        role: normalizedRole,
                        dayNumber,
                        levels: formattedLevels
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate assignment');
                }
                
                setAssignmentPrompt(data.data.assignmentPrompt);
                setStatus('ready');
            } catch (err) {
                console.error("Assignment generate error:", err);
                setErrorMsg(err.message || "Kyle could not prepare the assignment right now. Please try again in a few seconds.");
                setStatus('error');
            }
        };

        generateAssignment();
    }, [open, user, dayNumber, levels, role, assignmentPrompt, retryNonce]);

    const handleSubmit = async () => {
        if (!userResponse.trim() || !assignmentPrompt) return;
        
        setStatus('scoring');
        setErrorMsg(null);

        try {
            if (!user) throw new Error("Please sign in again to continue.");
            const idToken = await user.getIdToken();
            const normalizedRole = normalizeRole(role);

            const response = await fetch('/api/v2/kyle/assignment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    role: normalizedRole,
                    dayNumber,
                    levels: formattedLevels,
                    assignmentPrompt,
                    userResponse
                })
            });

            const data = await response.json();
            
            if (response.status === 423) {
                if (data.error && data.error.includes("already passed")) {
                    setStatus('already-passed');
                    localStorage.setItem(`assignment_passed_${roadmapId}_${dayId}`, "true");
                    return;
                }
                if (data.lockedUntil) {
                    setLockedUntil(data.lockedUntil);
                    setStatus('cooldown');
                    return;
                }
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit assignment');
            }

            // `passed` from the API is authoritative — do not recalculate from score.
            const { score, feedback, passed, attemptsRemaining, lockedUntil, breakdown, weaknesses } = data.data;
            const uiPassed = Boolean(passed);
            
            setScoreData({ score, feedback, attemptsRemaining, lockedUntil, breakdown, weaknesses, uiPassed });

            if (uiPassed) {
                localStorage.setItem(`assignment_passed_${roadmapId}_${dayId}`, "true");
                setStatus('result_pass');
            } else {
                setStatus('result_fail');
            }
        } catch (err) {
            console.error("Assignment submit error:", err);
            setErrorMsg(err.message || "Kyle could not score this right now. Please try again.");
            setStatus('error'); // Will let them retry answer if it was scoring failure
        }
    };
    
    const handleRetryGenerate = () => {
        setErrorMsg(null);
        setAssignmentPrompt("");
        hasFetched.current = false;
        setRetryNonce(prev => prev + 1);
        setStatus('loading');
    };

    const handleRetryAnswer = () => {
        setStatus('ready');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-orange-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Day {dayNumber} &middot; Assignment</h3>
                            <p className="text-sm text-gray-500">You've finished today's lessons.</p>
                        </div>
                    </div>
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {normalizeRole(role)}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[75vh]">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-gray-600 font-medium">Kyle is preparing your Day {dayNumber} assignment...</p>
                        </div>
                    )}
                    
                    {status === 'scoring' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-gray-600 font-medium">Kyle is evaluating your response...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-gray-800 font-medium">{errorMsg}</p>
                            <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
                                {assignmentPrompt ? (
                                    <button 
                                        onClick={handleRetryAnswer}
                                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={18} /> Retry Answer
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleRetryGenerate}
                                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={18} /> Try Again
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors"
                                >
                                    Back to Roadmap
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {status === 'cooldown' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-orange-500" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">Assignment Locked</h4>
                            <p className="text-gray-600">
                                You have used all attempts. Try again after {new Date(lockedUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full max-w-sm mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors"
                            >
                                Back to Roadmap
                            </button>
                        </div>
                    )}

                    {status === 'already-passed' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <CheckCircle className="w-16 h-16 text-blue-500" />
                            <h4 className="text-xl font-bold text-gray-900">Already Passed</h4>
                            <p className="text-gray-600">You already passed this assignment.</p>
                            <button 
                                onClick={onPassed}
                                className="w-full max-w-sm mt-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-95"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {status === 'ready' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-orange-100 p-5 rounded-2xl shadow-sm">
                                <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                                    {assignmentPrompt}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <textarea 
                                    className="w-full h-48 p-4 bg-white border border-gray-200 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none leading-relaxed text-gray-800"
                                    placeholder="Write your answer here. No word limit — think it through."
                                    value={userResponse}
                                    onChange={(e) => setUserResponse(e.target.value)}
                                ></textarea>
                                <p className="text-xs text-gray-500 font-medium px-2 flex justify-between">
                                    <span>Kyle will read and score your answer out of 10</span>
                                    <span>Required: {requiredScore}/10</span>
                                </p>
                            </div>
                            
                            <button
                                onClick={handleSubmit}
                                disabled={!userResponse.trim()}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center text-lg"
                            >
                                Submit Answer
                            </button>
                        </div>
                    )}

                    {(status === 'result_pass' || status === 'result_fail') && scoreData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col items-center text-center space-y-3">
                                {status === 'result_pass' ? (
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-2xl font-black text-green-600">{scoreData.score}</span>
                                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest mt-[-2px]">Score</span>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-2xl font-black text-orange-600">{scoreData.score}</span>
                                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-[-2px]">Score</span>
                                    </div>
                                )}
                                <h4 className={`text-2xl font-extrabold ${status === 'result_pass' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {status === 'result_pass' ? 'Great work' : 'Needs improvement'}
                                </h4>
                                <p className="text-gray-500 font-medium">Required: {requiredScore}/10 to unlock the next day</p>
                            </div>

                            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                                <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Bot size={18} className="text-blue-500" /> Feedback from Kyle
                                </h5>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {scoreData.feedback}
                                </p>
                                
                                {scoreData.weaknesses && scoreData.weaknesses.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h6 className="font-semibold text-gray-700 text-sm mb-2">Areas to improve:</h6>
                                        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                                            {scoreData.weaknesses.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                {status === 'result_pass' ? (
                                    <button
                                        onClick={onPassed}
                                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 text-lg flex items-center justify-center gap-2"
                                    >
                                        {isFinalDay ? (
                                            <>Finish Roadmap <Home size={20} /></>
                                        ) : (
                                            <>Continue to Day {dayNumber + 1} <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        {scoreData.attemptsRemaining > 0 ? (
                                            <>
                                                <button
                                                    onClick={() => setStatus('ready')}
                                                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 text-lg flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCcw size={20} /> Retry Answer
                                                </button>
                                                <p className="text-center text-sm text-gray-500 font-medium">
                                                    {scoreData.attemptsRemaining} attempt(s) remaining before a 6-hour cooldown.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={onClose}
                                                    className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                                                >
                                                    Back to Roadmap
                                                </button>
                                                {scoreData.lockedUntil ? (
                                                    <p className="text-center text-sm text-red-500 font-medium mt-3">
                                                        No attempts remaining. Assignment locked for 6 hours.<br/>
                                                        Try again after {new Date(scoreData.lockedUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.
                                                    </p>
                                                ) : (
                                                    <p className="text-center text-sm text-red-500 font-medium mt-3">
                                                        No attempts remaining. Please try again later.
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KyleAssignmentModal;
