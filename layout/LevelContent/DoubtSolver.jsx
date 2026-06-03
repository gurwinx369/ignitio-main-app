import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
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
    const messagesEndRef = useRef(null);

    // Resolve role once
    const resolvedRole = useRef(propRole || (typeof window !== 'undefined' ? localStorage.getItem('profession') : null) || 'other');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const currentQuestion = question.trim();
        setQuestion('');
        setError(null);

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
                    question: currentQuestion
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            const answer = data?.data?.answer || data?.answer || "Kyle responded, but no answer text was returned.";
            setMessages(prev => [...prev, { role: 'kyle', text: answer }]);
        } catch (err) {
            console.error('DoubtSolver Error:', err);
            setError(err.message || 'Failed to connect to Kyle.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-6">
            <div className="bg-[#FAF9F6] rounded-[2rem] shadow-md border border-orange-100 flex flex-col h-[600px] overflow-hidden relative">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-orange-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Ask Kyle</h3>
                        <p className="text-xs text-gray-500">Your AI Learning Assistant</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                                    msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
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
                                <div className="px-5 py-4 shadow-sm bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-sm italic ml-1">Kyle is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
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
                <div className="bg-white p-4 border-t border-gray-100">
                    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto flex items-end gap-2">
                        <div className="relative flex-1 bg-[#F3F4F6] rounded-2xl overflow-hidden border border-transparent focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/50 transition-all">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Ask a question about ${level.concept || 'this topic'}...`}
                                className="w-full max-h-32 min-h-[56px] py-3.5 pl-4 pr-12 bg-transparent resize-none outline-none text-gray-700 text-sm sm:text-base scrollbar-thin"
                                rows={1}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!question.trim() || loading}
                            className="shrink-0 h-14 px-5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <span className="hidden sm:inline">Ask Kyle</span>
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[11px] text-gray-400">Kyle can make mistakes. Consider verifying important information.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoubtSolver;
