import React from 'react';

export default function KylePetBubble({ message, onClose, isLeftAligned, onFocusTip, onAskKyle, onResetPosition, onHideKyle }) {
  if (!message) return null;

  return (
    <div className={`absolute bottom-full mb-4 ${isLeftAligned ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} min-w-[200px] max-w-[280px] sm:max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-cyan-100 dark:border-cyan-900/50 p-4 pb-5 z-10 before:content-[''] before:absolute before:bottom-[-8px] ${isLeftAligned ? 'before:left-6' : 'before:right-6'} before:border-t-8 before:border-t-white dark:before:border-t-slate-800 before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent shadow-cyan-500/10 dark:shadow-cyan-500/5 animate-in fade-in zoom-in-95 duration-200`}>
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
        <p className="text-sm text-slate-700 dark:text-slate-200 pr-4">
          {message}
        </p>

        {(onFocusTip || onAskKyle || onResetPosition || onHideKyle) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            {onFocusTip && (
              <button
                onClick={onFocusTip}
                className="text-xs font-medium px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors whitespace-nowrap"
              >
                Focus Tip
              </button>
            )}
            {onAskKyle && (
              <button
                onClick={onAskKyle}
                className="text-xs font-medium px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Ask Kyle
              </button>
            )}
            {onResetPosition && (
              <button
                onClick={onResetPosition}
                className="text-xs font-medium px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Reset Position
              </button>
            )}
            {onHideKyle && (
              <button
                onClick={onHideKyle}
                className="text-xs font-medium px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors whitespace-nowrap"
              >
                Hide Kyle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
