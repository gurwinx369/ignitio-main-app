import { CircleCheck, Flag } from "lucide-react";
import {
  CARD_H,
  FINISH_H,
  LABEL_H,
  PILL_BASE_MS,
  PILL_STEP_MS,
  checkDelay,
} from "./roadmap-data";
import { delay } from "./reveal-utils";

const PILLS_PER_ROW = 2;
const ROW_STAGGER = 20;

function chunk(items, size) {
  const rows = [];
  for (let i = 0; i < items.length; i += size)
    rows.push(items.slice(i, i + size));
  return rows;
}

export function StageCard({ stage, on }) {
  const { icon: Icon, accent } = stage;
  const isFinish = stage.kind === "finish";
  const accentStyle = { "--accent": accent };
  const rows = chunk(stage.concepts, PILLS_PER_ROW);
  const checkAt = checkDelay(stage.concepts.length);

  return (
    <div style={accentStyle} data-on={on}>
      <div
        className="rm-reveal rm-slide flex items-center gap-2"
        style={{ height: LABEL_H, ...delay(0) }}
      >
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-(--accent)">
          {stage.weekLabel}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ig-muted/70">
          {stage.days}
        </span>
        {stage.startHere && (
          <span
            className="rm-reveal rm-badge ml-auto rounded-full bg-ig-text/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ig-text"
            style={delay(700)}
          >
            Start here
          </span>
        )}
      </div>

      <div className="rm-reveal rm-pop" style={delay(120)}>
        <article
          className={`rm-card relative flex flex-col overflow-hidden rounded-3xl hover:-translate-y-0.5 ${
            isFinish ? "rm-finish" : ""
          }`}
          style={{ height: isFinish ? FINISH_H : CARD_H }}
        >
          <div
            className="rm-icon pointer-events-none absolute -right-4 -top-5"
            style={delay(isFinish ? 400 : 480)}
          >
            <Icon
              aria-hidden="true"
              className="size-28 rotate-12 text-(--accent)"
              strokeWidth={1.1}
              style={{ opacity: 0.12 }}
            />
          </div>

          {isFinish ? (
            <>
              <div className="relative flex h-full flex-col p-5">
                <div
                  data-burst={stage.id}
                  className="rm-reveal rm-badge flex size-9 items-center justify-center rounded-xl text-ig-bg"
                  style={{ background: accent, ...delay(360) }}
                >
                  <Flag
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={2.5}
                  />
                </div>
                <h3
                  className="rm-reveal rm-fade mt-3.5 text-balance text-xl font-extrabold leading-tight tracking-tight text-ig-text"
                  style={delay(480)}
                >
                  {stage.title}
                </h3>
                <p
                  className="rm-reveal rm-fade mt-2 text-pretty text-sm leading-relaxed text-ig-muted"
                  style={delay(620)}
                >
                  {stage.outcome}
                </p>
                <div
                  className="rm-chip rm-reveal rm-fade mt-auto flex items-center gap-2 self-start rounded-full px-3 py-1.5 font-mono text-xs font-semibold"
                  style={delay(780)}
                >
                  <CircleCheck aria-hidden="true" className="size-3.5" />
                  <span className="rm-type inline-block" style={delay(1000)}>
                    github.com/you/your-project
                  </span>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="rm-shine pointer-events-none absolute inset-0"
              />
            </>
          ) : (
            <div className="relative flex h-full items-center gap-3.5 px-5">
              <div
                className="rm-reveal rm-badge flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-extrabold text-ig-bg"
                style={{ background: accent, ...delay(360) }}
              >
                {stage.number}
              </div>
              <h3
                className="rm-reveal rm-fade text-balance text-xl font-extrabold leading-tight tracking-tight text-ig-text"
                style={delay(440)}
              >
                {stage.title}
              </h3>
            </div>
          )}
        </article>
      </div>

      {!isFinish && (
        <>
          <ul
            className="mt-4 flex flex-col gap-2.5"
            aria-label={`${stage.title} concepts`}
          >
            {rows.map((row, rowIndex) => (
              <li key={row.join("-")} className="flex">
                <ul
                  className="flex flex-wrap gap-2.5"
                  style={{ marginLeft: rowIndex % 2 === 1 ? ROW_STAGGER : 0 }}
                >
                  {row.map((concept) => (
                    <li
                      key={concept}
                      className="rm-reveal rm-pill"
                      style={delay(
                        PILL_BASE_MS +
                          stage.concepts.indexOf(concept) * PILL_STEP_MS,
                      )}
                    >
                      <span className="block whitespace-nowrap rounded-full border border-ig-text/30 px-4 py-2 text-xs font-medium leading-none text-ig-text transition-colors duration-300 hover:border-(--accent) hover:text-(--accent)">
                        {concept}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <p
            className="rm-reveal rm-fade mt-4 flex items-center gap-2 text-sm font-semibold text-ig-muted"
            style={delay(checkAt - 60)}
          >
            <span
              data-burst={stage.id}
              className="rm-node inline-flex"
              style={delay(checkAt)}
            >
              <CircleCheck
                aria-hidden="true"
                className="size-4 shrink-0 text-(--accent)"
              />
            </span>
            {stage.outcome}
          </p>
        </>
      )}
    </div>
  );
}
