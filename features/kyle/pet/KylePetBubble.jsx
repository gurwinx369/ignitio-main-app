import React, { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export default function KylePetBubble({ message, visualState, onClose, isLeftAligned, onFocusTip, onAskKyle, onResetPosition, onHideKyle }) {
  const posthog = usePostHog();
  
  const [retroText, setRetroText] = useState('|');

  useEffect(() => {
    if (visualState === 'thinking') {
      const frames = ['|', '.|', '..|', '...|'];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % frames.length;
        setRetroText(frames[i]);
      }, 500);
      return () => clearInterval(interval);
    } else if (message) {
      let i = 0;
      setRetroText('|');
      const interval = setInterval(() => {
        i++;
        setRetroText(message.substring(0, i) + (i < message.length ? '|' : ''));
        if (i >= message.length) {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [visualState, message]);
  
  if (!message && visualState !== 'thinking') return null;

  const isEmpathetic = visualState === 'empathetic';
  const borderClass = isEmpathetic ? 'border-amber-100 dark:border-amber-900/50' : 'border-cyan-100 dark:border-cyan-900/50';
  const shadowClass = isEmpathetic ? 'shadow-amber-500/10 dark:shadow-amber-500/5' : 'shadow-cyan-500/10 dark:shadow-cyan-500/5';
  
  return (
    <div className={`absolute bottom-full mb-4 ${isLeftAligned ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} min-w-[200px] max-w-[280px] sm:max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg border ${borderClass} p-4 pb-5 z-10 before:content-[''] before:absolute before:bottom-[-8px] ${isLeftAligned ? 'before:left-6' : 'before:right-6'} before:border-t-8 before:border-t-white dark:before:border-t-slate-800 before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent ${shadowClass} animate-in fade-in zoom-in-95 duration-200`}>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Close message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      <div className="flex flex-col gap-3">
        <p className={`pr-4 font-mono font-bold ${visualState === 'thinking' ? 'text-cyan-600 dark:text-cyan-400 tracking-widest text-lg' : visualState === 'angry' ? 'text-red-500 dark:text-red-400 tracking-tight text-[15px]' : isEmpathetic ? 'text-amber-600 dark:text-amber-400 tracking-tight text-[15px]' : 'text-slate-700 dark:text-slate-200 tracking-tight text-[14px]'}`}>
          {retroText}
        </p>


      </div>
    </div>
  );
}
