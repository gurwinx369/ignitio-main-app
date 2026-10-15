import {
  ANCHOR_Y,
  CARD_W,
  STAGES,
  TRACK_HEIGHT,
  TRACK_WIDTH,
  cardTop,
  stageX,
} from "./roadmap-data";
import { delay } from "@/lib/onboarding/reveal-utils";

const RADIUS = 22;

export function RoadmapConnectors({
  linked,
  stages = STAGES,
  trackWidth = TRACK_WIDTH,
  trackHeight = TRACK_HEIGHT,
}) {
  const links = stages.slice(0, -1).map((stage, i) => {
    const next = stages[i + 1];
    const x1 = stageX(i) + CARD_W;
    const y1 = cardTop(i) + ANCHOR_Y;
    const x2 = stageX(i + 1);
    const y2 = cardTop(i + 1) + ANCHOR_Y;
    const xm = (x1 + x2) / 2;
    const ym = (y1 + y2) / 2;
    const d = `M${x1} ${y1} H${xm - RADIUS} Q${xm} ${y1} ${xm} ${y1 + RADIUS} V${y2 - RADIUS} Q${xm} ${y2} ${xm + RADIUS} ${y2} H${x2}`;
    return { id: `${stage.id}-${next.id}`, from: stage, to: next, x1, y1, x2, y2, xm, ym, d };
  });

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0"
        width={trackWidth}
        height={trackHeight}
        viewBox={`0 0 ${trackWidth} ${trackHeight}`}
        fill="none"
      >
        <defs>
          {links.map((link) => (
            <linearGradient
              key={link.id}
              id={`rm-grad-${link.id}`}
              gradientUnits="userSpaceOnUse"
              x1={link.x1}
              x2={link.x2}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor={link.from.accent} />
              <stop offset="1" stopColor={link.to.accent} />
            </linearGradient>
          ))}
        </defs>

        {links.map((link, i) => (
          <g key={link.id} data-on={linked > i}>
            <mask
              id={`rm-mask-${link.id}`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={trackWidth}
              height={trackHeight}
            >
              <path
                d={link.d}
                pathLength={1}
                className="rm-draw"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                style={delay(0)}
              />
            </mask>

            <g mask={`url(#rm-mask-${link.id})`}>
              <path
                d={link.d}
                stroke={`url(#rm-grad-${link.id})`}
                strokeOpacity="0.22"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d={link.d}
                className="rm-flow"
                stroke={`url(#rm-grad-${link.id})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />
            </g>

            <circle
              cx={link.x1}
              cy={link.y1}
              r="3.5"
              fill={link.from.accent}
              className="rm-node"
              style={delay(0)}
            />
            <circle
              cx={link.x2}
              cy={link.y2}
              r="3.5"
              fill={link.to.accent}
              className="rm-node"
              style={delay(520)}
            />
            <g className="rm-node" style={delay(280)}>
              <circle
                cx={link.xm}
                cy={link.ym}
                r="8"
                className="rm-pulse"
                fill="none"
                stroke={link.to.accent}
                strokeWidth="1.5"
              />
              <circle
                cx={link.xm}
                cy={link.ym}
                r="9"
                className="fill-ig-bg"
                stroke={link.to.accent}
                strokeWidth="2"
              />
              <circle
                cx={link.xm}
                cy={link.ym}
                r="3.5"
                className="fill-ig-text"
              />
            </g>
          </g>
        ))}
      </svg>

      {links.map((link, i) => (
        <div
          key={`spark-${link.id}`}
          aria-hidden="true"
          data-on={linked > i}
          className="pointer-events-none absolute inset-0"
        >
          <span
            className="rm-spark"
            style={{
              "--c": link.to.accent,
              offsetPath: `path("${link.d}")`,
            }}
          />
        </div>
      ))}
    </>
  );
}
