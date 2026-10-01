import React, { useState, useEffect, useRef, startTransition } from 'react';
import Image from 'next/image';
import { Send, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/context/AuthContext';

function renderBasicMarkdown(text) {
  const normalizedText = String(text || "")
    .replace(/\\\*/g, "*");

  const tokens = normalizedText.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);

  return tokens.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**")
    ) {
      return (
        <em key={index} className="italic text-gray-900">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

const DoubtSolver = ({ level, roadmapType, role: propRole }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'kyle', text: `Hi! I'm Kyle. Ask me any question about "${level.concept || level.title}" and I'll help you out.` }
    ]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHighDemand, setIsHighDemand] = useState(false);
    const messagesEndRef = useRef(null);
    const lastQuestion = useRef('');

    // Resolve role once
    const resolvedRole = useRef(propRole || (typeof window !== 'undefined' ? localStorage.getItem('profession') : null) || 'other');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, error]);

    const sendQuestion = async (currentQuestion) => {
        setError(null);
        setIsHighDemand(false);

        if (!user) {
            setError("Please sign in again to ask Kyle.");
            return;
        }

        setMessages(prev => [...prev, { role: 'user', text: currentQuestion }]);
        setLoading(true);

        try {
            const idToken = await user.getIdToken();
            if (!idToken) {
                throw new Error("Please sign in again to ask Kyle.");
            }

            const response = await fetch('/api/v2/kyle/doubt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    concept: level.concept || level.title,
                    transcript: level.transcript || level.description,
                    roadmapType,
                    role: resolvedRole.current,
                    question: currentQuestion,
                    pageContext: `User is viewing DoubtSolver modal for ${level.concept || level.title || 'this lesson'}`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.retryable) {
                    setIsHighDemand(true);
                    return;
                }
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            const rawAnswer = data?.data?.answer || data?.answer || "Kyle responded, but no answer text was returned.";
            const answer = rawAnswer.replace(/<thinking>[\s\S]*?<\/thinking>\n*/g, '').trim();
            startTransition(() => {
                setMessages(prev => [...prev, { role: 'kyle', text: answer }]);
            });
        } catch (err) {
            setError(err.message || 'Failed to connect to Kyle.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const currentQuestion = question.trim();
        lastQuestion.current = currentQuestion;
        setQuestion('');
        await sendQuestion(currentQuestion);
    };

    const handleRetry = async () => {
        if (!lastQuestion.current || loading) return;
        // Remove the last user bubble so it doesn't duplicate when resending
        setMessages(prev => {
            const lastUserIdx = [...prev].reverse().findIndex(m => m.role === 'user');
            if (lastUserIdx === -1) return prev;
            const realIdx = prev.length - 1 - lastUserIdx;
            return prev.filter((_, i) => i !== realIdx);
        });
        await sendQuestion(lastQuestion.current);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-6">
            <div className="bg-[#fffaf3] rounded-3xl shadow-xl border-2 border-[#e5d5c5]/50 flex flex-col h-[600px] overflow-hidden relative">
                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-[#e5d5c5]/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#e5d5c5] shadow-sm">
                            <Image src="/kyle/kyle.svg" alt="Kyle" width={40} height={40} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-[20px] font-extrabold text-[#19183b] tracking-tight">Ask Kyle</h3>
                            <p className="text-[#7775a5] font-semibold text-[13px]">Your AI Learning Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-1 border-2 ${
                                    msg.role === 'user' ? 'bg-[#ddf2ff] text-[#007bcc] border-[#00a9ff] shadow-sm' : 'bg-white p-0.5 overflow-hidden border-[#e5d5c5] shadow-sm'
                                }`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Image src="/kyle/kyle.svg" alt="Kyle" width={32} height={32} className="w-full h-full rounded-full object-cover" />}
                                </div>
                                <div className={`px-5 py-4 text-[15px] font-semibold leading-relaxed border-2 ${
                                    msg.role === 'user' 
                                        ? 'bg-[#ddf2ff] text-[#001d32] border-[#00a9ff] shadow-[0_3px_0_#3081AD] rounded-2xl rounded-tr-sm' 
                                        : 'bg-white text-[#1a2a3a] border-[#e5d5c5] shadow-[0_3px_0_#FFDCBC] rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                                }`}>
                                    {msg.role === 'kyle' ? renderBasicMarkdown(msg.text) : msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading ? (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-1 bg-white p-0.5 overflow-hidden border-2 border-[#e5d5c5] shadow-sm">
                                    <Image src="/kyle/kyle.svg" alt="Kyle" width={32} height={32} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <div className="px-5 py-4 bg-white text-[#7775a5] font-semibold border-2 border-[#e5d5c5] shadow-[0_3px_0_#FFDCBC] rounded-2xl rounded-tl-sm flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-[#7775a5] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-[#7775a5] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-[#7775a5] rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[15px] italic ml-1">Kyle is thinking...</span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* High-demand retry card */}
                    {isHighDemand && !loading ? (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-1 bg-white p-0.5 overflow-hidden border-2 border-[#e5d5c5] shadow-sm">
                                    <Image src="/kyle/kyle.svg" alt="Kyle" width={32} height={32} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <div className="bg-white border-2 border-[#ef4444]/30 shadow-[0_3px_0_rgba(239,68,68,0.2)] rounded-2xl rounded-tl-sm px-5 py-4 flex flex-col gap-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={18} className="text-[#ef4444] mt-0.5 shrink-0" />
                                        <p className="text-[15px] font-semibold text-[#19183b] leading-snug">
                                            Kyle is experiencing <span className="font-extrabold text-[#ef4444]">heavy demand</span> right now and couldn&apos;t respond. Your question is saved — give it a moment and try again.
                                        </p>
                                    </div>
                                    <button
                                        id="kyle-retry-btn"
                                        onClick={handleRetry}
                                        disabled={loading}
                                        className="self-start text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ↩ Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Generic error pill */}
                    {error && !isHighDemand ? (
                        <div className="flex justify-center my-4">
                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-red-100">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        </div>
                    ) : null}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 sm:p-6 border-t-2 border-[#e5d5c5]/50">
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
                        <div className="relative flex-1 bg-white border-2 border-[#e5d5c5] rounded-2xl shadow-[0_3px_0_#FFDCBC] overflow-hidden focus-within:border-[#00a9ff] focus-within:shadow-[0_3px_0_#3081AD] transition-all">
                            <textarea
                                value={question}
                                onChange={(e) => {
                                    if (e.target.value.length <= 500) {
                                        setQuestion(e.target.value);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={`Ask a question about ${level.concept || 'this topic'}...`}
                                className="w-full max-h-32 min-h-[56px] py-4 pl-5 pr-12 bg-transparent resize-none outline-none text-[#19183b] font-semibold text-[15px] scrollbar-thin"
                                rows={1}
                            />
                            <div className="absolute bottom-3 right-4 text-[12px] font-bold text-[#7775a5]">
                                {question.length}/500
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!question.trim() || loading}
                            className="btn-push shrink-0 h-14 w-14 bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl flex items-center justify-center shadow-none"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[11px] text-slate-400">Kyle can make mistakes. Consider verifying important information.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoubtSolver;
