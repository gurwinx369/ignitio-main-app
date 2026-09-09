import React, {
  useEffect,
  useRef,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const WORLD_SCROLL_EVENT =
  "ignitio:roadmap-world-scroll";

export default function RoadmapWorldsCarousel({
  roadmaps,
  initialActiveId,
}) {
  const scrollRef =
    useRef(null);

  const scrollEndTimerRef =
    useRef(null);

  const isScrollingRef =
    useRef(false);

  /* =====================================================
     CARD HELPERS
  ===================================================== */

  const getCards = () => {
    const container =
      scrollRef.current;

    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll(
        "[data-roadmap-rail-item]",
      ),
    );
  };

  const getClosestCardIndex =
    () => {
      const container =
        scrollRef.current;

      if (!container) {
        return 0;
      }

      const cards =
        getCards();

      if (!cards.length) {
        return 0;
      }

      const containerRect =
        container.getBoundingClientRect();

      let closestIndex = 0;
      let closestDistance =
        Infinity;

      cards.forEach(
        (
          card,
          index,
        ) => {
          const cardRect =
            card.getBoundingClientRect();

          const distance =
            Math.abs(
              cardRect.left -
              containerRect.left,
            );

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            closestIndex =
              index;
          }
        },
      );

      return closestIndex;
    };

  const scrollToCard = (
    index,
    behavior = "smooth",
  ) => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const cards =
      getCards();

    if (!cards.length) {
      return;
    }

    const safeIndex =
      Math.max(
        0,
        Math.min(
          index,
          cards.length - 1,
        ),
      );

    const target =
      cards[safeIndex];

    const containerRect =
      container.getBoundingClientRect();

    const targetRect =
      target.getBoundingClientRect();

    const targetLeft =
      container.scrollLeft +
      targetRect.left -
      containerRect.left;

    container.scrollTo({
      left: targetLeft,
      behavior,
    });
  };

  const scrollByCard =
    (direction) => {
      const currentIndex =
        getClosestCardIndex();

      scrollToCard(
        currentIndex +
        direction,

        "smooth",
      );
    };

  /* =====================================================
     INITIAL POSITION
  ===================================================== */

  useEffect(() => {
    if (
      !initialActiveId ||
      !roadmaps?.length ||
      !scrollRef.current
    ) {
      return;
    }

    const index =
      roadmaps.findIndex(
        (roadmap) =>
          roadmap.id ===
          initialActiveId,
      );

    if (index < 0) {
      return;
    }

    const frame =
      requestAnimationFrame(
        () => {
          const container =
            scrollRef.current;

          if (!container) {
            return;
          }

          const cards =
            Array.from(
              container.querySelectorAll(
                "[data-roadmap-rail-item]",
              ),
            );

          const target =
            cards[index];

          if (!target) {
            return;
          }

          const containerRect =
            container.getBoundingClientRect();

          const targetRect =
            target.getBoundingClientRect();

          const targetLeft =
            container.scrollLeft +
            targetRect.left -
            containerRect.left;

          container.scrollTo({
            left: targetLeft,
            behavior: "auto",
          });
        },
      );

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [
    initialActiveId,
    roadmaps,
  ]);

  /* =====================================================
     PERFORMANCE:
     FREEZE CANVAS ANIMATIONS WHILE SCROLLING
  ===================================================== */

  useEffect(() => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const broadcastScrollState =
      (scrolling) => {
        window.dispatchEvent(
          new CustomEvent(
            WORLD_SCROLL_EVENT,
            {
              detail: {
                scrolling,
              },
            },
          ),
        );
      };

    const handleScroll =
      () => {
        /*
         * Important:
         *
         * Do NOT set React state here.
         *
         * Trackpad scrolling can generate
         * dozens of events per second.
         *
         * A ref avoids re-rendering the
         * whole roadmap rail.
         */
        if (
          !isScrollingRef.current
        ) {
          isScrollingRef.current =
            true;

          container.dataset.scrolling =
            "true";

          broadcastScrollState(
            true,
          );
        }

        if (
          scrollEndTimerRef.current
        ) {
          clearTimeout(
            scrollEndTimerRef.current,
          );
        }

        scrollEndTimerRef.current =
          window.setTimeout(
            () => {
              isScrollingRef.current =
                false;

              delete container.dataset
                .scrolling;

              broadcastScrollState(
                false,
              );
            },
            140,
          );
      };

    container.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll,
      );

      if (
        scrollEndTimerRef.current
      ) {
        clearTimeout(
          scrollEndTimerRef.current,
        );
      }

      /*
       * Ensure animations resume
       * if the carousel unmounts
       * during a scroll.
       */
      broadcastScrollState(
        false,
      );
    };
  }, []);

  if (!roadmaps?.length) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="mb-10 w-full">
      {/* HEADER */}

      <div
        className="
          mb-5
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <h2
            className="
              text-xl
              font-extrabold
              text-[#19183B]

              sm:text-2xl
            "
          >
            Roadmap Worlds
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-[#19183B]/55

              sm:text-sm
            "
          >
            Explore structured learning
            paths built like game worlds.
          </p>
        </div>

        {/* CONTROLS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              scrollByCard(-1)
            }
            aria-label="Previous roadmap"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              border
              border-[#DFC8B5]

              bg-[#FFFDF9]

              text-[#19183B]

              shadow-[0_3px_0_#D9C4B0]

              transition-[transform,box-shadow]
              duration-150

              hover:-translate-y-px

              active:translate-y-[2px]
              active:scale-[0.98]
              active:shadow-[0_1px_0_#D9C4B0]

              sm:h-10
              sm:w-10
            "
          >
            <ChevronLeft
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              scrollByCard(1)
            }
            aria-label="Next roadmap"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              border
              border-[#DFC8B5]

              bg-[#FFFDF9]

              text-[#19183B]

              shadow-[0_3px_0_#D9C4B0]

              transition-[transform,box-shadow]
              duration-150

              hover:-translate-y-px

              active:translate-y-[2px]
              active:scale-[0.98]
              active:shadow-[0_1px_0_#D9C4B0]

              sm:h-10
              sm:w-10
            "
          >
            <ChevronRight
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </button>
        </div>
      </div>

      {/* =================================================
          NATIVE SCROLL RAIL

          No mandatory snapping.
          No React scroll-state.
          Native compositor owns movement.
      ================================================= */}

      <div
        ref={scrollRef}
        className="
          roadmap-world-rail

          relative

          -mx-4

          flex
          items-stretch
          gap-4

          overflow-x-auto
          overflow-y-visible

          px-4
          pb-10
          pt-4

          overscroll-x-contain

          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
        style={{
          WebkitOverflowScrolling:
            "touch",

          scrollBehavior:
            "auto",

          overscrollBehaviorX:
            "contain",
        }}
      >
        {roadmaps.map(
          (
            item,
            index,
          ) => (
            <div
              key={
                item.id ||
                index
              }
              data-roadmap-rail-item
              className="
                shrink-0
                min-w-0

                flex

                w-[88%]

                sm:w-[320px]

                lg:w-[340px]
              "
            >
              <div
                className="
                  h-[590px]
                  w-full

                  [&>*]:h-full
                "
              >
                {React.cloneElement(
                  item.component,
                  {
                    variant:
                      "world",
                  },
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* =================================================
          PERFORMANCE CSS

          Expensive effects disappear while
          the compositor is moving the rail.
      ================================================= */}

      <style>{`
        .roadmap-world-rail[data-scrolling="true"]
          [data-roadmap-rail-item] > div > * {
          filter: none !important;
          transition: none !important;
          transform: translateZ(0) !important;
        }

        .roadmap-world-rail[data-scrolling="true"]
          [data-roadmap-rail-item] {
          pointer-events: none;
        }

        .roadmap-world-rail[data-scrolling="true"]
          [data-roadmap-animated-visual],
        .roadmap-world-rail[data-scrolling="true"]
          [data-roadmap-animated-visual] * {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}