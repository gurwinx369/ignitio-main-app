import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorToast = ({ title, message, onDismiss, onTryAgain }) => {
  if (!title && !message) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#fcf5ee]/80 backdrop-blur-sm p-6 font-sans">
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#ede8e1] p-6 w-full max-w-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mb-4 shrink-0">
          <AlertCircle className="text-[#ef4444]" size={32} />
        </div>
        <h3 className="text-[20px] font-bold text-[#19183b] mb-2 leading-tight">{title}</h3>
        <p className="text-[#64748b] text-[15px] mb-8 leading-relaxed">
          {message.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
        
        <div className="w-full flex flex-col gap-3">
          {onTryAgain && (
            <button
              onClick={onTryAgain}
              className="w-full h-14 bg-[#00a9ff] text-white text-[16px] font-extrabold rounded-full shadow-[0_5px_0px_#0085cc] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full h-14 bg-white text-[#64748b] font-bold rounded-full border-2 border-[#ede8e1] hover:bg-[#f8f9fa] active:scale-[0.98] transition-all"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
