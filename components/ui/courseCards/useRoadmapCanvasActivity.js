"use client";

import {
    useEffect,
    useRef,
} from "react";

const WORLD_SCROLL_EVENT =
    "ignitio:roadmap-world-scroll";

/*
 * Controls whether expensive roadmap canvas
 * animations should currently run.
 *
 * Animation pauses when:
 *
 * 1. Worlds rail is scrolling.
 * 2. Canvas leaves the viewport.
 * 3. Browser tab is hidden.
 *
 * This is visual-only and owns no roadmap state.
 */
export default function useRoadmapCanvasActivity(
    elementRef,
) {
    const activeRef =
        useRef(true);

    const visibleRef =
        useRef(true);

    const scrollingRef =
        useRef(false);

    const pageVisibleRef =
        useRef(true);

    useEffect(() => {
        const element =
            elementRef.current;

        if (!element) {
            return;
        }

        const updateActive =
            () => {
                activeRef.current =
                    visibleRef.current &&
                    !scrollingRef.current &&
                    pageVisibleRef.current;
            };

        /* -----------------------------------------------
           VISIBILITY INSIDE VIEWPORT
        ------------------------------------------------ */

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    visibleRef.current =
                        Boolean(
                            entry?.isIntersecting,
                        );

                    updateActive();
                },
                {
                    /*
                     * Start slightly before entering view
                     * so animation is ready by the time
                     * the card becomes visible.
                     */
                    rootMargin:
                        "120px",

                    threshold: 0,
                },
            );

        observer.observe(
            element,
        );

        /* -----------------------------------------------
           WORLD RAIL SCROLL
        ------------------------------------------------ */

        const handleWorldScroll =
            (event) => {
                scrollingRef.current =
                    Boolean(
                        event?.detail
                            ?.scrolling,
                    );

                updateActive();
            };

        window.addEventListener(
            WORLD_SCROLL_EVENT,
            handleWorldScroll,
        );

        /* -----------------------------------------------
           BROWSER TAB VISIBILITY
        ------------------------------------------------ */

        const handleVisibility =
            () => {
                pageVisibleRef.current =
                    !document.hidden;

                updateActive();
            };

        document.addEventListener(
            "visibilitychange",
            handleVisibility,
        );

        updateActive();

        return () => {
            observer.disconnect();

            window.removeEventListener(
                WORLD_SCROLL_EVENT,
                handleWorldScroll,
            );

            document.removeEventListener(
                "visibilitychange",
                handleVisibility,
            );
        };
    }, [
        elementRef,
    ]);

    return activeRef;
}