import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/features/context/AuthContext";
import { fetchCalibrationStatus } from "./calibrationApi";

const INITIAL_STATE = {
  status: "idle",
  calibrationRequired: false,
  error: null,
};

export function useCalibrationStatus({
  enabled = false,
} = {}) {
  const { user } = useAuth();

  const [state, setState] =
    useState(INITIAL_STATE);

  const abortControllerRef =
    useRef(null);

  const fetchStatus = useCallback(
    async (currentUser) => {
      abortControllerRef.current?.abort();

      if (!currentUser || !enabled) {
        abortControllerRef.current = null;
        return null;
      }

      const abortController =
        new AbortController();

      abortControllerRef.current =
        abortController;

      setState({
        status: "loading",
        calibrationRequired: false,
        error: null,
      });

      try {
        const data =
          await fetchCalibrationStatus(
            currentUser,
            {
              signal:
                abortController.signal,
            },
          );

        if (
          abortController.signal.aborted
        ) {
          return null;
        }

        const nextState = {
          status: data.status,
          calibrationRequired:
            data.calibrationRequired,
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
          calibrationRequired: false,
          error,
        };

        setState(nextState);

        return nextState;
      } finally {
        if (
          abortControllerRef.current ===
          abortController
        ) {
          abortControllerRef.current =
            null;
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    fetchStatus(user);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [user, fetchStatus]);

  const retry = useCallback(
    () => fetchStatus(user),
    [fetchStatus, user],
  );

  /*
   * Do not synchronously reset state from an effect
   * when the hook becomes disabled. Return the
   * effective idle state instead.
   */
  const effectiveState =
    enabled && user
      ? state
      : INITIAL_STATE;

  return {
    ...effectiveState,
    retry,
  };
}