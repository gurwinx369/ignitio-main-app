import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/features/context/AuthContext";
import { fetchPremiumAccess } from "./premiumAccessApi";

const INITIAL_STATE = {
  status: "loading",
  hasGenAiAccess: false,
  error: null,
};

export function usePremiumAccess() {
  const { user } = useAuth();

  const [state, setState] =
    useState(INITIAL_STATE);

  const abortControllerRef = useRef(null);

  const fetchAccess = useCallback(
    async (currentUser) => {
      abortControllerRef.current?.abort();

      if (!currentUser) {
        abortControllerRef.current = null;
        setState(INITIAL_STATE);
        return null;
      }

      const abortController =
        new AbortController();

      abortControllerRef.current =
        abortController;

      setState(INITIAL_STATE);

      try {
        const data = await fetchPremiumAccess(
          currentUser,
          {
            signal: abortController.signal,
          },
        );

        if (abortController.signal.aborted) {
          return null;
        }

        const nextState = {
          status: data.hasGenAiAccess
            ? "premium"
            : "foundation",
          hasGenAiAccess:
            data.hasGenAiAccess,
          error: null,
        };

        setState(nextState);

        return nextState;
      } catch (error) {
        if (
          abortController.signal.aborted ||
          error?.name === "AbortError"
        ) {
          return null;
        }

        const nextState = {
          status: "error",
          hasGenAiAccess: false,
          error,
        };

        setState(nextState);

        return nextState;
      } finally {
        if (
          abortControllerRef.current ===
          abortController
        ) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchAccess(user);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [user, fetchAccess]);

  const retry = useCallback(
    () => fetchAccess(user),
    [fetchAccess, user],
  );

  return {
    ...state,
    retry,
  };
}