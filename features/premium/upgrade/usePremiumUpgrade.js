import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useAuth } from "@/features/context/AuthContext";
import { ensurePremiumUpgrade } from "./upgradeApi";

const INITIAL_STATE = {
    status: "idle",
    upgradeStatus: null,
    alreadyUpgraded: false,
    personalizationId: null,
    progressId: null,
    error: null,
};

export function usePremiumUpgrade({
    enabled = false,
} = {}) {
    const { user } = useAuth();

    const [state, setState] =
        useState(INITIAL_STATE);

    const abortControllerRef =
        useRef(null);

    const runUpgrade = useCallback(
        async (currentUser) => {
            abortControllerRef.current?.abort();

            if (!currentUser || !enabled) {
                abortControllerRef.current =
                    null;

                return null;
            }

            const abortController =
                new AbortController();

            abortControllerRef.current =
                abortController;

            setState({
                status: "loading",
                upgradeStatus: null,
                alreadyUpgraded: false,
                personalizationId: null,
                progressId: null,
                error: null,
            });

            try {
                const data =
                    await ensurePremiumUpgrade(
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
                    status: "ready",
                    upgradeStatus:
                        data.upgradeStatus,
                    alreadyUpgraded:
                        data.alreadyUpgraded,
                    personalizationId:
                        data.personalizationId,
                    progressId:
                        data.progressId,
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
                    upgradeStatus:
                        error?.upgradeStatus ??
                        null,
                    alreadyUpgraded: false,
                    personalizationId: null,
                    progressId: null,
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
        runUpgrade(user);

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [user, runUpgrade]);

    const retry = useCallback(
        () => runUpgrade(user),
        [runUpgrade, user],
    );

    /*
     * Keep the disabled state effectively idle
     * without synchronously resetting React state
     * from an effect.
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