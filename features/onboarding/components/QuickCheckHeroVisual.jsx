"use client";

export default function QuickCheckHeroVisual({
  className = "",
}) {
  return (
    <div
      className={`relative overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* EARTH — starts below Kyle, center stays fixed */}
      <div className="pointer-events-none absolute left-1/2 top-[54%] z-0 w-[150vw] max-w-[720px] -translate-x-1/2 sm:top-[53%] sm:w-[135vw] sm:max-w-[860px] lg:top-[52%] lg:w-[78vw] lg:max-w-[1050px] xl:max-w-[1150px]">
        <div className="qc-earth-enter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/figma/environment/earth-hd.png"
            alt=""
            draggable="false"
            className="qc-earth-spin block h-auto w-full select-none"
          />
        </div>
      </div>

      {/* KYLE — flies above Earth */}
      <div className="pointer-events-none absolute left-1/2 top-[8%] z-20 w-[165px] -translate-x-1/2 sm:top-[7%] sm:w-[190px] lg:top-[6%] lg:w-[240px] xl:w-[260px]">
        <div className="qc-kyle-enter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/figma/kyle/kyle-flying.svg"
            alt=""
            draggable="false"
            className="qc-kyle-flight block h-auto w-full select-none"
          />
        </div>
      </div>

      <style jsx global>{`
        .qc-earth-enter {
          animation: earthEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .qc-earth-spin {
          animation: earthSpin 14s linear 700ms infinite;
          transform-origin: 50% 50%;
          will-change: transform;
          backface-visibility: hidden;
        }

        .qc-kyle-enter {
          animation: kyleEnter 1050ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .qc-kyle-flight {
          animation: kyleFlight 2.6s ease-in-out 900ms infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        @keyframes earthEnter {
          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* True fixed-center axis rotation */
        @keyframes earthSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* Kyle actually enters like he is flying */
        @keyframes kyleEnter {
          from {
            opacity: 0;
            transform:
              translate3d(-280px, 90px, 0)
              rotate(-12deg)
              scale(0.82);
          }

          70% {
            opacity: 1;
            transform:
              translate3d(18px, -8px, 0)
              rotate(2deg)
              scale(1.02);
          }

          to {
            opacity: 1;
            transform:
              translate3d(0, 0, 0)
              rotate(0deg)
              scale(1);
          }
        }

        /* Glide path instead of simple up/down bobbing */
        @keyframes kyleFlight {
          0% {
            transform:
              translate3d(-32px, 8px, 0)
              rotate(-4deg);
          }

          25% {
            transform:
              translate3d(-12px, -12px, 0)
              rotate(-2deg);
          }

          50% {
            transform:
              translate3d(30px, -20px, 0)
              rotate(3deg);
          }

          75% {
            transform:
              translate3d(12px, -5px, 0)
              rotate(1deg);
          }

          100% {
            transform:
              translate3d(-32px, 8px, 0)
              rotate(-4deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .qc-earth-enter,
          .qc-earth-spin,
          .qc-kyle-enter,
          .qc-kyle-flight {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}