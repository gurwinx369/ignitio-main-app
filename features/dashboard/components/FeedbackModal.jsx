"use client";

import { useState } from "react";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/context/AuthContext";
import { usePathname } from "next/navigation";

export default function FeedbackModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorText, setErrorText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 5 || trimmed.length > 1000) {
      setErrorText("Message must be between 5 and 1000 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorText("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/v2/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed, page: pathname }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setStatus("success");
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 300);
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorText(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Send Feedback</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Thank you!</h3>
              <p className="text-slate-500 text-sm">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-slate-500 mb-4">
                Have an idea, found a bug, or just want to say hi? Let us know what you think.
              </p>
              
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Write your feedback here (min 5 chars)..."
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none text-slate-700 text-sm mb-2"
                disabled={status === "loading"}
              />
              
              <div className="flex items-center justify-between mt-1 mb-4">
                <span className={`text-xs ${message.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {message.length} / 1000
                </span>
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{errorText}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  disabled={status === "loading"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading" || message.trim().length < 5 || message.length > 1000}
                  className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
