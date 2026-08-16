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
        className="mt-4 flex items-center gap-2 p-4 bg-card border border-border rounded-xl text-sm"
      >
        <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
        <span className="text-foreground font-medium">
          {message ?? "Payment confirmed. Redirecting\u2026"}
        </span>
      </div>
    );
  }

  if (variant === "dismissed") {
    return (
      <div
        role="status"
        className="mt-4 flex items-center gap-2 p-4 bg-card border border-border rounded-xl text-sm"
      >
        <Info className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
        <span className="text-muted-foreground">
          {message ?? "Checkout closed. You can try again whenever you\u2019re ready."}
        </span>
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div
        role="alert"
        className="mt-4 flex items-start gap-2 p-4 bg-card border border-border rounded-xl text-sm"
      >
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
        <span className="text-foreground">
          {message ?? "Something went wrong. Please try again."}
        </span>
      </div>
    );
  }

  return null;
}
