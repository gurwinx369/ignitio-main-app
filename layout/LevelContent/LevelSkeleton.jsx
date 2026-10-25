'use client';

import React from 'react';
import { ArrowLeft, Play, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';

/**
 * LevelSkeleton — Global Apple-grade loading skeleton for dedicated level views.
 *
 * Grounded in Apple HIG (loading.md & materials.md):
 * - Exactly mirrors the spatial footprint, aspect ratios (16:9), and corner radii
 *   of LevelContent and VideoTab to eliminate Cumulative Layout Shift (CLS).
 * - Implements a calm, left-to-right luminance sweep matching natural reading direction.
 * - Respects prefers-reduced-motion with gentle opacity pulsing fallback.
 *
 * @param {string} color - Accent color for subtle atmospheric tinting (default: #f59e0b)
 * @param {boolean} showPracticeStep - Whether to render step progress indicator placeholder
 */
export default function LevelSkeleton({ color = '#f59e0b', showPracticeStep = false }) {
  const shimmerBg = 'rgba(226, 232, 240, 0.65)'; // slate-200/65
  const shimmerLight = 'rgba(255, 255, 255, 0.7)';
  const borderTint = 'rgba(203, 213, 225, 0.4)';  // slate-300/40

  return (
    <div
      className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-100 font-sans relative"
      role="status"
      aria-label="Loading lesson content"
      aria-busy="true"
    >
      {/* Static Keyframe Styles */}
      <style>{`
        @keyframes _level_sk_sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .level-sk-sweep {
          position: relative;
          overflow: hidden;
        }
        .level-sk-sweep::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255, 255, 255, 0.65) 50%,
            transparent 70%
          );
          animation: _level_sk_sweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .level-sk-sweep::after {
            animation: none;
            background: transparent;
          }
        }
      `}</style>

      {/* Subtle atmospheric ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: color, opacity: 0.035 }}
      />

      <div className="flex-1 w-full min-w-0">
        {/* Header Navigation */}
        <div className="bg-transparent px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            {/* Back Button Skeleton */}
            <div
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full mb-6 border shadow-sm level-sk-sweep"
              style={{
                backgroundColor: shimmerBg,
                borderColor: borderTint,
                width: '110px',
                height: '42px',
              }}
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 opacity-40 shrink-0" />
              <div className="h-3 w-10 bg-slate-300/60 rounded-full" />
            </div>

            {/* Step Indicator Skeleton (if multi-step practice lesson) */}
            {showPracticeStep && (
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="h-2.5 rounded-full flex-1 bg-slate-200 level-sk-sweep" />
                  <div className="h-2.5 rounded-full flex-1 bg-slate-200 level-sk-sweep" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Lesson Content Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 sm:space-y-8">
          {/* Video Player 16:9 Skeleton Card */}
          <div
            className="w-full aspect-video rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200/60 flex items-center justify-center level-sk-sweep"
            style={{
              backgroundColor: 'rgba(226, 232, 240, 0.85)',
            }}
          >
            {/* Centered play icon silhouette */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-md border border-white/50 text-slate-400/60">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-current opacity-50" />
            </div>
          </div>

          {/* Title and Action Row */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Title Placeholder */}
              <div className="h-8 sm:h-9 w-3/4 sm:w-2/3 max-w-md bg-slate-300/70 rounded-xl level-sk-sweep" />
              
              {/* Complete / Next Step Button Placeholder */}
              <div className="h-10 w-32 sm:w-36 bg-slate-300/60 rounded-full level-sk-sweep shrink-0" />
            </div>

            {/* Description Lines */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full bg-slate-200/80 rounded-md level-sk-sweep" />
              <div className="h-4 w-5/6 bg-slate-200/80 rounded-md level-sk-sweep" />
              <div className="h-4 w-2/3 bg-slate-200/70 rounded-md level-sk-sweep" />
            </div>

            {/* Watch Progress & Checkpoint Indicator Skeleton */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-sm space-y-4">
              {/* Top row: Label + % */}
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 bg-slate-200 rounded-md level-sk-sweep" />
                <div className="h-3.5 w-8 bg-slate-200 rounded-md level-sk-sweep" />
              </div>

              {/* Progress track with 50% and 80% checkpoints */}
              <div className="relative h-2.5 bg-slate-200/90 rounded-full my-6">
                {/* 50% Checkpoint marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: '50%' }}
                >
                  <div className="absolute bottom-2 flex flex-col items-center text-slate-400 opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5">Checkpoint 1</span>
                    <Flag className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-xs" />
                </div>

                {/* 80% Checkpoint marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: '80%' }}
                >
                  <div className="absolute bottom-2 flex flex-col items-center text-slate-400 opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5">Checkpoint 2</span>
                    <Flag className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-xs" />
                </div>
              </div>

              {/* Bottom hint line */}
              <div className="h-3 w-48 bg-slate-200/60 rounded-md level-sk-sweep" />
            </div>
          </div>

          {/* Helpful Feedback Section Skeleton */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-4 w-32 bg-slate-200/80 rounded-md level-sk-sweep" />
            <div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300/40 flex items-center justify-center text-slate-400/60 level-sk-sweep">
              <ThumbsUp className="w-4 h-4 opacity-50" />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300/40 flex items-center justify-center text-slate-400/60 level-sk-sweep">
              <ThumbsDown className="w-4 h-4 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
