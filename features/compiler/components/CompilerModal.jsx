"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import CompilerPage from "./CompilerPage";

export default function CompilerModal({ isOpen, onClose, language = "cpp" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-[#19183B]/80 backdrop-blur-sm"
    >
      <div 
        className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[#F9F7F5] rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(25,24,59,0.2)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFC8B5] shrink-0 bg-[#F2E0D0]/30">
          <h2 className="text-xl font-bold text-[#19183B]">Code Playground</h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close code playground"
            className="p-2 rounded-full text-[#19183B]/60 hover:text-[#19183B] hover:bg-white/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9FF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 relative">
          <CompilerPage language={language} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
