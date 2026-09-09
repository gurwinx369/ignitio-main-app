"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";

// â”€â”€â”€ Icon data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ICONS = [
  { id: "python",   src: "/onboarding/figma/icons/support-icon.svg",    alt: "Python"   },
  { id: "pinecone", src: "/onboarding/figma/icons/pinecone-icon.svg",   alt: "Pinecone" },
  { id: "database", src: "/onboarding/figma/icons/database-icon.svg",   alt: "Database" },
  { id: "git",      src: "/onboarding/figma/icons/git-branch-icon.svg", alt: "Git"      },
];

/**
 * True elliptical arc: RX controls horizontal spread, RY controls height.
 * Angles 205°→335° cover the upper arc (sin is negative = above anchor on screen).
 * i=0 → far left / low, i=1 → upper-left, i=2 → upper-right, i=3 → far right / low.
 */
const RX        = 155;   // horizontal semi-axis — wide spread
const RY        = 68;    // vertical semi-axis — flatter ellipse
const START_DEG = 205;
const END_DEG   = 335;
const ENTRY_DEG = 180;   // Where the icons spawn from (far left)
const ICON_SIZE = 76;    // px — rendered size of each logo
// paddingTop keeps the anchor point below the topmost icon + a little margin
const HERO_PAD  = RY + ICON_SIZE / 2 + 18;

// Generate an array of points along the ellipse from a start angle to a target angle
function getArcPath(targetDeg, steps = 15) {
  const xs = [];
  const ys = [];
  for (let i = 0; i <= steps; i++) {
    const deg = ENTRY_DEG + (i / steps) * (targetDeg - ENTRY_DEG);
    const rad = (deg * Math.PI) / 180;
    xs.push(Math.cos(rad) * RX);
    ys.push(Math.sin(rad) * RY);
  }
  return { x: xs, y: ys };
}

// ——————————————————————————————————————————————————————————————————————————————————————————————————————
function Star() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="#F59E0B" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// â”€â”€â”€ Sequential SVG connector line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// stroke-dashoffset draws from 0â†’LINE_H; only GPU-composited ops used.
const LINE_H = 48;
function AnimatedConnector({ controls }) {
  return (
    <div className="w-[3px] mx-auto my-1" style={{ height: LINE_H }}>
      <svg width="3" height={LINE_H} viewBox={`0 0 3 ${LINE_H}`} aria-hidden="true">
        <line x1="1.5" y1="0" x2="1.5" y2={LINE_H} stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <motion.line
          x1="1.5" y1="0" x2="1.5" y2={LINE_H}
          stroke="#00A9FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={LINE_H}
          initial={{ strokeDashoffset: LINE_H }}
          animate={controls}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PaymentExplainer() {
  const stages = [
    {
      id: "today",
      label: "Right now, you're ahead of 90% of your class",
      description: "Pay once, unlock everything immediately. Start Week 1 right now.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      id: "every_cycle",
      label: "Your roadmap keeps adapting as you grow",
      description: "Renews automatically, so your learning never gets interrupted.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      ),
    },
    {
      id: "anytime",
      label: "Full control. No pressure. Always yours.",
      description: "Cancel in one tap from settings. No calls, no forms, no runaround.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
    },
  ];

  // â”€â”€ Icon arc â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const heroRef    = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-40px" });

  // â”€â”€ Timeline sequential lines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const timelineRef    = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-50px" });
  const line1 = useAnimation();
  const line2 = useAnimation();

  useEffect(() => {
    if (!timelineInView) return;
    // Line 1: node 0 spring settles ~450ms after inView trigger
    const t1 = setTimeout(() => line1.start({ strokeDashoffset: 0 }), 480);
    // Line 2: node 1 spring settles ~220ms later
    const t2 = setTimeout(() => line2.start({ strokeDashoffset: 0 }), 740);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineInView]);

  return (
    <div className="mt-8">

      {/* â”€â”€â”€ Semi-circular icon hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        ref={heroRef}
        className="relative flex flex-col items-center"
        style={{ paddingTop: HERO_PAD }}
      >
        {/*
          Anchor div sits at the top-centre of the heading block.
          Each icon is absolutely offset by its arc (x, y) from this anchor.
          All icons start at (0,0) â€” stacked at centre â€” then spring out.
        */}
        <div
          className="absolute left-1/2"
          style={{ top: HERO_PAD, transform: "translate(-50%, -50%)" }}
          aria-hidden="true"
        >
          {ICONS.map((icon, i) => {
            const targetDeg = START_DEG + (i / (ICONS.length - 1)) * (END_DEG - START_DEG);
            const path = getArcPath(targetDeg);

            return (
              <motion.div
                key={icon.id}
                className="absolute"
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  marginLeft: -(ICON_SIZE / 2),
                  marginTop: -(ICON_SIZE / 2),
                  willChange: "transform, filter, opacity",
                }}
                initial={{ 
                  x: path.x[0], 
                  y: path.y[0], 
                  opacity: 0, 
                  scale: 0.5,
                  filter: "blur(8px)",
                }}
                animate={
                  heroInView
                    ? { 
                        x: path.x, 
                        y: path.y, 
                        opacity: [0, 0.2, 0.4, 1], 
                        scale: [0.5, 0.8, 1, 1],
                        filter: ["blur(8px)", "blur(4px)", "blur(0px)", "blur(0px)"],
                      }
                    : { 
                        x: path.x[0], 
                        y: path.y[0], 
                        opacity: 0, 
                        scale: 0.5,
                        filter: "blur(8px)",
                      }
                }
                transition={{
                  delay: 0.1 + i * 0.12,
                  duration: 0.65 + i * 0.1, // further icons take slightly longer
                  ease: "easeOut",
                  times: [0, 0.4, 0.8, 1], // timing for the array keyframes
                }}
              >
                <img
                  src={icon.src}
                  alt={icon.alt}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Heading fades in after icons start spreading */}
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold text-[#001D32] mb-1">
            Most students who skip this come back.
          </h2>
          <p className="text-sm text-slate-500">Don&apos;t lose momentum.</p>
        </motion.div>
      </div>

      {/* â”€â”€â”€ Centered sequential timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* Timeline block — container centred, internals left-aligned */}
      <motion.div
        ref={timelineRef}
        className="mt-10 mx-auto w-full max-w-sm flex flex-col pl-2 pr-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.22 } },
        }}
      >
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            className="flex gap-5"
            variants={{
              hidden:  { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 16 } },
            }}
          >
            {/* Left rail: circle + animated connector line */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-[#FFDCBC] flex items-center justify-center text-[#001D32] shrink-0">
                {stage.icon}
              </div>
              {i === 0 && <AnimatedConnector controls={line1} />}
              {i === 1 && <AnimatedConnector controls={line2} />}
            </div>

            {/* Right: label + description */}
            <div className="pb-8 pt-2">
              <p className="font-bold text-[#001D32] text-base leading-tight mb-0.5">
                {stage.label}
              </p>
              <p className="text-slate-500 text-sm leading-snug">
                {stage.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* â”€â”€â”€ Testimonials â€” 3-column grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-8">
        <p className="text-[10px] font-semibold tracking-widest text-[#00A9FF] uppercase text-center mb-4 opacity-80">
          What learners say
        </p>

        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-xl border border-[#FFDCBC] bg-[#fffaf3] px-3 py-3 flex flex-col">
            <div className="flex gap-0.5 mb-2" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => <Star key={i} />)}
            </div>
            <p className="text-[11px] text-[#001D32] leading-relaxed mb-2 flex-1">
              &ldquo;I had zero direction. Ignitio gave me an actual path &mdash; I{" "}
              <strong className="font-bold">stopped second-guessing and started finishing things</strong>{" "}
              for the first time.&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-auto">Riya M., 22</p>
          </div>

          <div className="rounded-xl border border-[#FFDCBC] bg-[#fffaf3] px-3 py-3 flex flex-col">
            <div className="flex gap-0.5 mb-2" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => <Star key={i} />)}
            </div>
            <p className="text-[11px] text-[#001D32] leading-relaxed mb-2 flex-1">
              &ldquo;I kept quitting every course. Here I understood{" "}
              <strong className="font-bold">why each concept mattered before I even coded it.</strong>{" "}
              That flipped everything.&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-auto">Karan D., 19</p>
          </div>

          <div className="rounded-xl border border-[#FFDCBC] bg-[#fffaf3] px-3 py-3 flex flex-col">
            <div className="flex gap-0.5 mb-2" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => <Star key={i} />)}
            </div>
            <p className="text-[11px] text-[#001D32] leading-relaxed mb-2 flex-1">
              &ldquo;The barrier felt so high. Turns out I just needed the right structure.{" "}
              <strong className="font-bold">The fear went away once I had a clear next step.</strong>&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-auto">Ananya S., 24</p>
          </div>

        </div>
      </div>
    </div>
  );
}
