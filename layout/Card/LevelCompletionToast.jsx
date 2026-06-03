import React, { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { roadmapThemes } from './theme';

const LevelCompletionToast = ({ difficulty = "beginner", color }) => {
    const baseTheme = roadmapThemes[difficulty] || roadmapThemes.beginner;
    const theme = color ? { ...baseTheme, accent: color } : baseTheme;
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger exit animation at 2.1s so it finishes before unmount at 2.5s
        const timer = setTimeout(() => {
            setIsLeaving(true);
        }, 2100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-4">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes toastEnter {
                    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes toastExit {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.8) translateY(-20px); }
                }
                .toast-enter { animation: toastEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: toastExit 0.4s ease-in forwards; }
            `}} />
            <div 
                className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border flex items-center gap-4 p-5 md:p-6 max-w-sm w-full mx-auto ${isLeaving ? 'toast-exit' : 'toast-enter'}`}
                style={{ 
                    borderColor: theme.accent,
                    boxShadow: `0 10px 30px ${theme.glow}`
                }}
            >
                <div 
                    className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center animate-bounce"
                    style={{ backgroundColor: `${theme.accent}20` }}
                >
                    <PartyPopper size={24} color={theme.accent} />
                </div>
                <div>
                    <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-white mb-1">
                        Level Complete!
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        Nice work. You're making progress.
                    </p>
                    <div 
                        className="inline-block px-2 py-1 rounded-md text-xs font-bold"
                        style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
                    >
                        +1 Lesson Completed
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelCompletionToast;
