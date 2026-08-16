import OnboardingShell from "../../components/OnboardingShell";

const SKILL_CARD_COUNT = 4;

export default function DiagnosticResultsSkeleton() {
  return (
    <OnboardingShell step={2}>
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading diagnostic results"
        className="w-full animate-pulse"
      >
        <span className="sr-only">
          Loading diagnostic results
        </span>

        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 h-10 w-72 max-w-full rounded-xl bg-slate-200" />
          <div className="mx-auto h-5 w-[420px] max-w-full rounded-lg bg-slate-200" />
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 h-7 w-48 rounded-lg bg-slate-200" />

          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-11/12 rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 h-8 w-44 rounded-lg bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({
              length: SKILL_CARD_COUNT,
            }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </div>

                <div className="space-y-3">
                  <div className="h-3.5 w-full rounded bg-slate-100" />
                  <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                </div>

                <div className="mt-5 h-2 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 h-5 w-32 rounded bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-10 h-14 w-full rounded-xl bg-slate-200" />
      </div>
    </OnboardingShell>
  );
}