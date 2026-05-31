import React from "react";
import { PlayCircle, Clock, CheckCircle2, ArrowRight, BarChart } from "lucide-react";
import { roadmapThemes } from './theme';

const LessonPopup = ({ level, isCompleted, isUnlocked = true, onStart, onClose, difficulty = "beginner" }) => {
    const theme = roadmapThemes[difficulty] || roadmapThemes.beginner;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-8"
                style={{ borderTopColor: theme.accent }}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                                style={{ backgroundColor: theme.glow, color: theme.accent }}
                            >
                                <BarChart className="w-3 h-3" /> {difficulty}
                            </span>

                            {isCompleted ? (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            ) : (
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    Up Next
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                            &times;
                        </button>
                    </div>

                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{level.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {level.description || "In this lesson, we will cover the core concepts and workflows required to master this topic."}
                    </p>

                    <div className="flex items-center gap-4 mb-8 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {level.durationInMinutes
                                ? `${level.durationInMinutes} min`
                                : "Duration unavailable"}
                        </div>
                    </div>

                    <button
                        onClick={() => isUnlocked && onStart(level)}
                        disabled={!isUnlocked}
                        className={`group w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all shadow-md font-bold text-lg 
                            ${!isUnlocked 
                                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                                : 'text-white active:scale-95 hover:shadow-lg hover:scale-[1.02]'}`}
                        style={{ backgroundColor: isUnlocked ? theme.accent : undefined }}
                    >
                        {!isUnlocked ? "Complete Previous Lesson First" : (isCompleted ? "Review Lesson" : "Start Lesson")}
                        {isUnlocked && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonPopup;
