"use client";

import { useId } from "react";
import { motion, useTransform } from "motion/react";

// Traced from the bolt baked into /streak/cup-brewed-t.png (400 x 640 artboard).
const BOLT = "M172 351 L233 351 L197 425 L233 430 L137 546 L159 462 L121 457 Z";
const PERIOD = 40;

function wavePath(width, amp, depth) {
  let d = "M0 0";
  for (let x = 0; x < width; x += PERIOD)
    d += ` q ${PERIOD / 4} ${-amp} ${PERIOD / 2} 0 t ${PERIOD / 2} 0`;
  return `${d} V ${depth} H 0 Z`;
}

const FRONT_WAVE = wavePath(240, 7, 260);
const BACK_WAVE = wavePath(240, 5, 260);
const STREAKS = Array.from({ length: 8 }, (_, i) => -48 + i * 48);

const BUBBLES = [
  { from: [142, 540], to: [196, 362], r: 4, delay: 0, dur: 2.4 },
  { from: [152, 520], to: [214, 368], r: 3, delay: 0.7, dur: 2.1 },
  { from: [138, 548], to: [180, 380], r: 2.5, delay: 1.3, dur: 2.7 },
  { from: [158, 500], to: [206, 360], r: 3.5, delay: 1.9, dur: 2.2 },
  { from: [146, 530], to: [170, 372], r: 2, delay: 0.4, dur: 1.9 },
];

const SPARKS = [
  { d: "M248 382 l10 -6 l-4 10 l12 -5", delay: 0.2 },
  { d: "M104 470 l-10 4 l8 4 l-12 6", delay: 1.1 },
  { d: "M240 470 l12 2 l-8 6 l12 4", delay: 1.9 },
];

export function EnergyCup({ charge, fill, sealed, alive }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name) => `${name}-${uid}`;

  const levelY = useTransform(fill, [0, 1], [560, 334]);
  const bloom = useTransform(() =>
    Math.max(charge.get() * 0.7, fill.get() * 0.85),
  );
  const coreOpacity = useTransform(fill, [0.7, 1], [0, 0.55]);
  const rimOpacity = useTransform(fill, [0.85, 1], [0, 0.55]);

  return (
    <svg
      viewBox="0 200 400 440"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id("bolt")}>
          <path d={BOLT} />
        </clipPath>
        <linearGradient id={id("liquid")} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#C8FCFF" />
          <stop offset="0.16" stopColor="#45DDFF" />
          <stop offset="0.55" stopColor="#1C9BFF" />
          <stop offset="1" stopColor="#0B47CC" />
        </linearGradient>
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("core")}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={id("flow")} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.06"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="6s"
              values="0.02 0.06;0.032 0.042;0.02 0.06"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={id("bloom")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={id("silhouette")} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0 0.12  0 0 0 1 0"
          />
        </filter>
      </defs>

      <g transform="translate(2.5 71)">
        <image href="/streak/streak_done.png" width="400" height="640" />
        <motion.image
          href="/streak/streak_done.png"
          width="400"
          height="640"
          filter={`url(#${id("silhouette")})`}
          initial={false}
          animate={{ opacity: sealed ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </g>

      <g transform="translate(23 0) translate(177 448) scale(0.72) translate(-177 -448)">
      <path d={BOLT} fill="#081220" />

      <motion.path
        d={BOLT}
        fill="#19C6FF"
        filter={`url(#${id("bloom")})`}
        style={{ opacity: bloom }}
      />
      {alive && (
        <motion.path
          d={BOLT}
          fill="#7FEFFF"
          filter={`url(#${id("bloom")})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.25, 0.75, 0.25], scale: [1, 1.06, 1] }}
          style={{ transformOrigin: "177px 448px" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <g clipPath={`url(#${id("bolt")})`}>
        <motion.g style={{ y: levelY }}>
          <motion.g
            animate={alive ? { y: [0, -5, 0] } : { y: 0 }}
            transition={{
              duration: 2.6,
              repeat: alive ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <g filter={`url(#${id("flow")})`}>
              <motion.g
                animate={{ x: [0, -PERIOD] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
              >
                <path
                  d={BACK_WAVE}
                  transform="translate(80 -6)"
                  fill="#0E6FE0"
                  opacity="0.85"
                />
              </motion.g>
              <motion.g
                animate={{ x: [-PERIOD, 0] }}
                transition={{
                  duration: 0.95,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <path
                  d={FRONT_WAVE}
                  transform="translate(80 0)"
                  fill={`url(#${id("liquid")})`}
                />
              </motion.g>
              <motion.g
                animate={{ y: [0, 48] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              >
                {STREAKS.map((y) => (
                  <path
                    key={y}
                    d={`M60 ${y + 18} L300 ${y - 40} L300 ${y - 26} L60 ${y + 32} Z`}
                    fill="#fff"
                    opacity="0.16"
                  />
                ))}
              </motion.g>
            </g>
          </motion.g>
        </motion.g>

        <motion.ellipse
          cx="182"
          cy="440"
          rx="34"
          ry="70"
          fill={`url(#${id("core")})`}
          style={{ opacity: coreOpacity }}
          animate={alive ? { scale: [0.85, 1.1, 0.85] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {alive &&
          BUBBLES.map((b, i) => (
            <motion.circle
              key={i}
              r={b.r}
              fill="#E9FDFF"
              initial={{ cx: b.from[0], cy: b.from[1], opacity: 0 }}
              animate={{
                cx: [b.from[0], b.to[0]],
                cy: [b.from[1], b.to[1]],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: b.dur,
                delay: b.delay,
                repeat: Infinity,
                ease: "easeIn",
              }}
            />
          ))}

        {alive && (
          <motion.rect
            y="330"
            width="34"
            height="240"
            fill={`url(#${id("sheen")})`}
            style={{ skewX: -24 }}
            initial={{ x: 60 }}
            animate={{ x: [60, 300] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              repeatDelay: 2.4,
              ease: "easeInOut",
            }}
          />
        )}

        <motion.path
          d={BOLT}
          fill="none"
          stroke="#D7FBFF"
          strokeWidth="6"
          strokeLinejoin="round"
          style={{ opacity: rimOpacity }}
        />
      </g>

      <path
        d={BOLT}
        fill="none"
        stroke="#060A10"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {alive &&
        SPARKS.map((s, i) => (
          <motion.path
            key={i}
            d={s.d}
            fill="none"
            stroke="#BFF6FF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.2, 1, 0] }}
            transition={{
              duration: 0.45,
              delay: s.delay,
              repeat: Infinity,
              repeatDelay: 2.2,
            }}
            style={{ filter: "drop-shadow(0 0 6px #19C6FF)" }}
          />
        ))}
      </g>
    </svg>
  );
}
