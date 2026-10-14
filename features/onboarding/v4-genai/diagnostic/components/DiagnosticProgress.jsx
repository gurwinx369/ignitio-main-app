export default function DiagnosticProgress({ current, total }) {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Question ${current} of ${total}`}
    >
      {/* Track */}
      <div
        className="relative h-[10px] w-full rounded-full"
        style={{ backgroundColor: "rgba(0,169,255,0.13)" }}
      >
        {/* Gradient fill — overflow visible so glint isn't clipped */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out overflow-visible"
          style={{
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #29b6f6 0%, #039be5 55%, #0277bd 100%)",
          }}
        >
          {/* White glint — clipped to the fill via clip-path so it never bleeds outside */}
          {percentage > 4 && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "10%",
                left: "6%",
                width: "clamp(18px, 22%, 60px)",
                height: "55%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.52)",
                filter: "blur(1px)",
                pointerEvents: "none",
                clipPath: "inset(0 0 0 0 round 999px)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
