import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, AlertCircle, RefreshCcw, Lock, ArrowRight, Home, Loader2 } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <div className="bg-[#fffaf3] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b-2 border-[#e5d5c5]/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
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
                            <h3 className="text-[20px] font-extrabold text-[#19183b] tracking-tight">Day {dayNumber} &middot; Assignment</h3>
                            <p className="text-sm text-[#7775a5] font-semibold">Kyle is reviewing your code.</p>
                        </div>
                    </div>
                    <span className="bg-[#ddf2ff] text-[#007bcc] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#80d4ff]">
                        {normalizeRole(role)}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[75vh]">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <p className="text-gray-500 font-medium tracking-tight">Kyle is preparing your Day {dayNumber} assignment...</p>
                        </div>
                    )}
                    
                    {status === 'scoring' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <p className="text-gray-500 font-medium tracking-tight">Kyle is evaluating your response...</p>
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
                                        className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={18} /> Retry Answer
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleRetryGenerate}
                                        className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={18} /> Try Again
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="btn-push-sm w-full py-3.5 rounded-2xl text-[#4A5568] font-bold text-[15px] uppercase tracking-wide bg-white border-[#e8e8f0] hover:text-[#001D32]"
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
                                className="btn-push-sm w-full max-w-sm mt-4 py-3.5 rounded-2xl text-[#4A5568] font-bold text-[15px] uppercase tracking-wide bg-white border-[#e8e8f0] hover:text-[#001D32]"
                            >
                                Back to Roadmap
                            </button>
                        </div>
                    )}

                    {status === 'already-passed' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 px-6">
                            <CheckCircle className="w-16 h-16 text-[#10b981]" />
                            <h4 className="text-2xl font-extrabold text-[#19183b]">Already Passed</h4>
                            <p className="text-[#7775a5] font-medium text-[15px]">You already passed this assignment.</p>
                            <button 
                                onClick={onPassed}
                                className="btn-push w-full max-w-sm mt-4 py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6]"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {status === 'ready' && (
                        <div className="space-y-6 px-6 pt-2 pb-6">
                            <div className="bg-white p-5 rounded-2xl shadow-[0_3px_0_#FFDCBC] border-2 border-[#e5d5c5]">
                                <p className="text-[#1a2a3a] leading-relaxed font-semibold text-[15px] whitespace-pre-wrap">
                                    {assignmentPrompt}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <textarea 
                                    className="w-full h-48 p-5 bg-white border-2 border-[#e5d5c5] rounded-2xl focus:bg-white focus:outline-none focus:border-[#00a9ff] shadow-[0_3px_0_#FFDCBC] focus:shadow-[0_3px_0_#3081AD] resize-none leading-relaxed text-[#1a2a3a] transition-all text-[15px] font-semibold"
                                    placeholder="Write your answer here. No word limit — think it through."
                                    value={userResponse}
                                    onChange={(e) => setUserResponse(e.target.value)}
                                ></textarea>
                                <p className="text-[13px] text-[#7775a5] font-bold px-2 flex justify-between tracking-tight">
                                    <span>Kyle will review and score your answer out of 10</span>
                                    <span>Required: {requiredScore}/10</span>
                                </p>
                            </div>
                            
                            <button
                                onClick={handleSubmit}
                                disabled={!userResponse.trim()}
                                className="btn-push w-full mt-4 py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                Submit Answer
                            </button>
                        </div>
                    )}

                    {(status === 'result_pass' || status === 'result_fail') && scoreData && (
                        <div className="space-y-8 px-6 pt-2 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col items-center text-center space-y-1">
                                <h4 className={`text-3xl font-extrabold tracking-tight ${status === 'result_pass' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                    {status === 'result_pass' ? 'Great work!' : 'Needs improvement'}
                                </h4>
                                <div className="text-6xl font-black text-[#19183b] mt-2">
                                    {scoreData.score}<span className="text-3xl text-[#7775a5] font-bold">/10</span>
                                </div>
                                <p className="text-[#7775a5] font-bold mt-2 text-[15px]">Required: {requiredScore}/10 to unlock the next day</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border-2 border-[#e5d5c5] shadow-[0_3px_0_#FFDCBC]">
                                <h5 className="font-extrabold text-[#19183b] text-[18px] mb-3 flex items-center gap-2 tracking-tight">
                                    <div className="w-6 h-6 shrink-0 flex items-center justify-center overflow-hidden rounded-full border border-[#e5d5c5]">
                                        <Image
                                            src="/kyle/kyle.svg"
                                            alt="Kyle"
                                            width={20}
                                            height={20}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div> Feedback from Kyle
                                </h5>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {scoreData.feedback}
                                </p>
                                
                                {scoreData.weaknesses && scoreData.weaknesses.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h6 className="font-semibold text-gray-900 text-sm mb-3 tracking-tight">Areas to improve:</h6>
                                        <ul className="list-disc pl-5 text-gray-600 space-y-2">
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
                                        className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] flex items-center justify-center gap-2"
                                    >
                                        {isFinalDay ? (
                                            <>Finish Roadmap <Home size={18} /></>
                                        ) : (
                                            <>Continue to Day {dayNumber + 1} <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {scoreData.attemptsRemaining > 0 ? (
                                            <>
                                                <button
                                                    onClick={() => setStatus('ready')}
                                                    className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCcw size={18} /> Retry Answer
                                                </button>
                                                <p className="text-center text-sm text-[#7775a5] font-bold">
                                                    {scoreData.attemptsRemaining} attempt(s) remaining before a 6-hour cooldown.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={onClose}
                                                    className="btn-push-sm w-full py-4 rounded-2xl text-[#4A5568] font-bold text-[15px] uppercase tracking-wide bg-white border-[#e8e8f0] hover:text-[#001D32]"
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
