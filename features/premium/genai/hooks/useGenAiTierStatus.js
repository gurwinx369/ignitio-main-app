import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/context/AuthContext";

const INITIAL_STATE = {
    status: "idle",
    beginnerSkipped: false,
    beginnerCompleted: false,
    beginnerIncludedCount: 0,
    beginnerCompletedCount: 0,
    error: null,
};

/**
 * Fetches GenAI tier status for the hub page.
 *
 * Returns:
 *   beginnerSkipped      — all W1–4 were skipped at onboarding
 *   beginnerCompleted    — all included W1–4 days are done
 *   intermediateUnlocked — derived: beginnerSkipped || beginnerCompleted
 *
 * Best practices:
 *   rerender-derived-state      — intermediateUnlocked derived during render, not stored
 *   rerender-split-combined-hooks — owns only tier-status, not premium access
 *   rerender-functional-setstate — uses functional setState in async callbacks
 */
export function useGenAiTierStatus({ enabled = false } = {}) {
    const { user } = useAuth();
    const [state, setState] = useState(INITIAL_STATE);
    const abortRef = useRef(null);

    const fetchStatus = useCallback(async (currentUser) => {
        abortRef.current?.abort();

        if (!currentUser || !enabled) {
            abortRef.current = null;
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setState((prev) => ({ ...prev, status: "loading", error: null }));

        try {
            const token = await currentUser.getIdToken();
            const res = await fetch("/api/v2/premium/genai/tier-status", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
                signal: controller.signal,
            });

            if (controller.signal.aborted) return;

            if (!res.ok) {
                throw new Error(`tier-status fetch failed: ${res.status}`);
            }

            const data = await res.json();

            setState({
                status: "ready",
                beginnerSkipped: data.beginnerSkipped ?? false,
                beginnerCompleted: data.beginnerCompleted ?? false,
                beginnerIncludedCount: data.beginnerIncludedCount ?? 0,
                beginnerCompletedCount: data.beginnerCompletedCount ?? 0,
                error: null,
            });
        } catch (err) {
            if (err?.name === "AbortError") return;

            setState((prev) => ({
                ...prev,
                status: "error",
                error: err,
            }));
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
        }
    }, [enabled]);

    useEffect(() => {
        fetchStatus(user);
        return () => abortRef.current?.abort();
    }, [user, fetchStatus]);

    const retry = useCallback(() => fetchStatus(user), [fetchStatus, user]);

    // rerender-derived-state: compute during render, not in an effect or extra state
    const effectiveState = enabled && user ? state : INITIAL_STATE;

    const intermediateUnlocked =
        effectiveState.beginnerSkipped || effectiveState.beginnerCompleted;

    return {
        ...effectiveState,
        intermediateUnlocked,
        retry,
    };
}
