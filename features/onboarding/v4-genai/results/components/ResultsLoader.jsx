"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Diagnostic results calculated.",
  "Creating your personalized experience...",
  "Your roadmap is created."
];

function generateNodes() {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 2,
  }));
}

export default function ResultsLoader({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  // Nodes must be generated inside useEffect, not in the render body.
  // Math.random() in the render body is called on the server (SSR) AND
  // on the client (hydration), producing different values both times —
  // causing a hydration mismatch. useEffect only ever runs client-side,
  // after hydration, so SSR emits an empty array and React never has
  // mismatched DOM to reconcile.
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    setNodes(generateNodes());
  }, []);

  useEffect(() => {
    // 1.5s per step -> Total 4.5s
    const stepDuration = 1500;

    const timers = [
      setTimeout(() => setCurrentStep(1), stepDuration),
      setTimeout(() => setCurrentStep(2), stepDuration * 2),
      setTimeout(() => {
        if (onComplete) onComplete();
      }, stepDuration * 3),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ backgroundColor: "#07131D" }}
    >
      {/* Background AI Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{
              width: node.size,
              height: node.size,
              left: `${node.initialX}%`,
              top: `${node.initialY}%`,
              backgroundColor: "#00A9FF",
              boxShadow: "0 0 10px rgba(0, 169, 255, 0.8)",
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, 0, -15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: node.delay,
            }}
          />
        ))}
        {/* Subtle radial gradient to focus on center */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at center, transparent 0%, #07131D 80%)"
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
        {/* Loader Core Animation */}
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 border-t-2 border-[#00A9FF] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-r-2 border-[#A0D2E8] rounded-full opacity-50"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          {/* Center glowing core */}
          <motion.div 
            className="w-4 h-4 bg-[#00A9FF] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 15px rgba(0, 169, 255, 0.8)" }}
          />
        </div>

        {/* Text Area */}
        <div className="h-16 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-medium text-white tracking-wide"
            >
              {STEPS[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full mt-8">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#00A9FF] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ boxShadow: "0 0 8px rgba(0, 169, 255, 0.5)" }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Diagnose</span>
            <span>Personalize</span>
            <span>Complete</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
