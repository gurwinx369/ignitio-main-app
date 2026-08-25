'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Lock, Download, Share2, X, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CertificateCanvas from '@/features/certificates/CertificateCanvas';

const CERTIFICATE_WIDTH = 735;
const CERTIFICATE_HEIGHT = 934;

// ponytail: previewScale mirrors CertificateUnlockedModal logic exactly
function usePreviewScale(containerRef, show) {
    const [scale, setScale] = useState(0.38);

    const update = useCallback(() => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const s = Math.min(
            1,
            (width - 24) / CERTIFICATE_WIDTH,
            (height - 24) / CERTIFICATE_HEIGHT
        );
        setScale(Math.max(0.28, s));
    }, [containerRef]);

    useEffect(() => {
        if (!show) return;
        const id = requestAnimationFrame(update);
        window.addEventListener('resize', update);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener('resize', update);
        };
    }, [show, update]);

    return scale;
}

export default function PreviewCardLockedModal({ certificate, roadmapId, completedLevelId, completedLevels, onClose }) {
    const router = useRouter();
    const containerRef = useRef(null);
    const scale = usePreviewScale(containerRef, true);
    const canvasId = `preview-cert-${certificate?.certificateKey || 'preview'}`;

    // Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSignupClick = () => {
        // Save preview payload so progress migrates automatically after signup
        try {
            localStorage.setItem('ignitio:preview_payload', JSON.stringify({
                roadmapId,
                completedLevelId,
                completedLevels,
                profession: localStorage.getItem('profession') || 'other',
                savedAt: Date.now(),
            }));
        } catch { /* storage full — non-fatal */ }

        router.push(`/auth/signup?from=preview&roadmap=${roadmapId}&level=${completedLevelId}`);
    };

    const scaledW = CERTIFICATE_WIDTH * scale;
    const scaledH = CERTIFICATE_HEIGHT * scale;

    return (
        <div
            className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full sm:max-w-[420px] max-h-[96dvh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-[#fffaf3] border border-[#f1e4d2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
                
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Mobile drag handle */}
                <div className="sm:hidden mx-auto mt-3 mb-0 h-1.5 w-10 rounded-full bg-slate-200" />

                {/* Content */}
                <div className="flex flex-col items-center px-5 pt-6 pb-4 overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-4 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            You just earned this
                        </div>
                        <h2 className="text-xl font-extrabold text-[#19183b] leading-tight">
                            Don't lose your progress.
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                            Your card is ready — but it's locked. Sign up free in{' '}
                            <span className="font-semibold text-[#00a9ff]">10 seconds</span>{' '}
                            to save your progress and unlock it forever.
                        </p>
                    </div>

                    {/* Blurred card preview */}
                    <div
                        ref={containerRef}
                        className="relative w-full flex justify-center items-center mb-4"
                        style={{ height: `${scaledH + 16}px` }}
                    >
                        {/* Blurred card */}
                        <div
                            className="relative shrink-0 rounded-xl overflow-hidden border border-[#f1e4d2] shadow-md"
                            style={{ width: `${scaledW}px`, height: `${scaledH}px` }}
                        >
                            <div
                                className="absolute top-0 left-0"
                                style={{
                                    width: `${CERTIFICATE_WIDTH}px`,
                                    height: `${CERTIFICATE_HEIGHT}px`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                    filter: 'blur(5px)',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                            >
                                <CertificateCanvas certificate={certificate} canvasId={canvasId} />
                            </div>

                            {/* Blur overlay with lock */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px]">
                                <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg border border-white/60 mx-4 text-center">
                                    <div className="w-10 h-10 rounded-full bg-[#19183b] flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-[13px] font-bold text-[#19183b] leading-snug">
                                        Sign up to unlock
                                    </p>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        Free forever • No credit card
                                    </p>
                                </div>
                            </div>

                            {/* Top-right lock badge */}
                            <div className="absolute top-2 right-2 w-8 h-8 bg-[#19183b] rounded-full flex items-center justify-center shadow-md z-10">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Disabled action buttons — shows what they'll get */}
                    <div className="w-full flex gap-3 mb-4 px-1 opacity-40 pointer-events-none select-none">
                        <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 bg-[#19183b] text-white h-11 rounded-xl font-semibold text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-[#19183b] border border-[#f1e4d2] h-11 rounded-xl font-semibold text-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    {/* Primary CTA */}
                    <div className="w-full px-1 pb-2">
                        <button
                            onClick={handleSignupClick}
                            className="group w-full flex items-center justify-center gap-2 bg-[#00a9ff] hover:bg-[#0095e0] text-white font-extrabold text-base h-14 rounded-2xl shadow-[0_5px_0px_#0085cc] active:translate-y-[3px] active:shadow-[0_2px_0px_#0085cc] transition-all"
                        >
                            Save My Progress & Get My Card
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
