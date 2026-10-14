import { CheckCircle2, AlertCircle, Info } from "lucide-react";

/**
 * PaymentStatus — Inline status messages below the action buttons.
 *
 * @param {"idle"|"dismissed"|"error"|"success"} variant
 * @param {string} [message]
 */
export default function PaymentStatus({ variant, message }) {
  if (!variant || variant === "idle") return null;

  if (variant === "success") {
    return (
      <div
        role="status"
        className="mt-4 flex items-center gap-2 p-4 bg-white border-2 border-[#FFDCBC] rounded-xl text-sm shadow-sm"
      >
        <CheckCircle2 className="w-5 h-5 text-[#00A9FF] shrink-0" aria-hidden="true" />
        <span className="text-[#001D32] font-bold">
          {message ?? "Payment confirmed. Redirecting\u2026"}
        </span>
      </div>
    );
  }

  if (variant === "dismissed") {
    return (
      <div
        role="status"
        className="mt-4 flex items-center gap-2 p-4 bg-white border-2 border-[#FFDCBC] rounded-xl text-sm shadow-sm"
      >
        <Info className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="text-slate-600 font-bold">
          {message ?? "Checkout closed. You can try again whenever you\u2019re ready."}
        </span>
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div
        role="alert"
        className="mt-4 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm shadow-sm"
      >
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="text-red-800 font-bold">
          {message ?? "Something went wrong. Please try again."}
        </span>
      </div>
    );
  }

  return null;
}
