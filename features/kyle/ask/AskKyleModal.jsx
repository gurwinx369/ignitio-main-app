import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, User, AlertCircle, Send, X } from 'lucide-react';
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

export default function AskKyleModal({ isOpen, onClose, options }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const INITIAL_MESSAGES = [
    { role: 'kyle', text: "Hi! I'm Kyle. Ask me about your roadmap, focus, learning strategy, or concepts. I’ll guide you." }
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHighDemand, setIsHighDemand] = useState(false);

  const messagesEndRef = useRef(null);
  const lastQuestion = useRef('');

  const wasOpenRef = useRef(isOpen);

  // Reset state only when transitioning from OPEN to CLOSED
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      setMessages(INITIAL_MESSAGES);
      setQuestion('');
      setError(null);
      setIsHighDemand(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll to bottom when open and content changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, loading, error, isHighDemand]);

  // Close modal if user navigates to a lesson/contextual page
  useEffect(() => {
    if (!isOpen) return;
    if (pathname && (pathname.includes('/lesson') || pathname.includes('/video') || pathname.includes('/interactive-overviews'))) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  if (!isOpen) return null;

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

      // Determine role safely
      const allowedRoles = ["student", "developer", "writer", "designer", "other"];
      let role = typeof window !== 'undefined' ? localStorage.getItem('profession') : null;
      role = (role || "").toLowerCase();
      if (!allowedRoles.includes(role)) {
        role = "student";
      }

      const response = await fetch('/api/v2/kyle/doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          mode: 'general',
          role: role,
          question: currentQuestion
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

      const answer = data?.data?.answer || data?.answer || "Kyle responded, but no answer text was returned.";
      setMessages(prev => [...prev, { role: 'kyle', text: answer }]);
    } catch (err) {
      setError(err.message || 'Failed to connect to Kyle.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    if (question.length > 500) {
      setError("Question must be 500 characters or less.");
      return;
    }

    const currentQuestion = question.trim();
    lastQuestion.current = currentQuestion;
    setQuestion('');
    await sendQuestion(currentQuestion);
  };

  const handleRetry = async () => {
    if (!lastQuestion.current || loading) return;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative h-[80vh] max-h-[800px] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Ask Kyle</h3>
              <p className="text-xs text-slate-500">Your Global AI Mentor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-600'
                  }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed ${msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                  }`}>
                  {msg.role === 'kyle' ? renderBasicMarkdown(msg.text) : msg.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-orange-100 text-orange-600">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 shadow-sm bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm italic ml-1">Kyle is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* High-demand retry card */}
          {isHighDemand && !loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-orange-100 text-orange-600">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                      Kyle is experiencing <span className="font-semibold text-orange-600">heavy demand</span> right now and couldn't respond. Your question is saved — give it a moment and try again.
                    </p>
                  </div>
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="self-start text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↩ Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generic error pill */}
          {error && !isHighDemand && (
            <div className="flex justify-center my-4">
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 sm:p-6 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="relative flex-1 bg-slate-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100/50 transition-all">
              <textarea
                value={question}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setQuestion(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kyle anything..."
                className="w-full max-h-32 min-h-[56px] py-3.5 pl-4 pr-12 bg-transparent resize-none outline-none text-slate-800 text-sm sm:text-base scrollbar-thin"
                rows={1}
              />
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-400">
                {question.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="shrink-0 h-14 px-5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[11px] text-slate-400">Kyle can make mistakes. Consider verifying important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
