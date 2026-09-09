export default function PaywallHeader() {
  const COLORS = {
    ink: "#001D32",
    muted: "#6B7280",
    blue: "#00A9FF",
  };
  return (
    <header className="text-center mb-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span
          className="uppercase text-xs font-bold tracking-widest"
          style={{ color: COLORS.blue }}
        >
          How long are you showing up for?
        </span>
        <h1
          className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight"
          style={{ color: COLORS.ink }}
        >
          Every plan here is a promise to your future self.
        </h1>
        <p
          className="mt-3 text-sm md:text-base"
          style={{ color: COLORS.muted }}
        >
          The longer you commit, the more Ignitio commits back.
        </p>
      </div>
    </header>
  );
}
