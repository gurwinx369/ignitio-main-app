import OnboardingShell from "../../components/OnboardingShell";

const FEATURE_COUNT = 4;

export default function PaywallSkeleton() {
  return (
    <OnboardingShell step={3}>
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading access options"
        className="w-full animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
      >
        <span className="sr-only">
          Loading access options
        </span>

        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 h-9 w-64 max-w-full rounded-xl bg-slate-200" />
          <div className="mx-auto h-5 w-96 max-w-full rounded-lg bg-slate-100" />
        </header>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 h-7 w-36 rounded-lg bg-slate-200" />
              <div className="h-4 w-48 max-w-full rounded bg-slate-200" />
            </div>

            <div className="h-8 w-24 rounded-full bg-slate-200" />
          </div>

          <div className="mb-7 flex items-end gap-2">
            <div className="h-11 w-28 rounded-lg bg-slate-200" />
            <div className="mb-1 h-4 w-16 rounded bg-slate-200" />
          </div>

          <div className="space-y-4">
            {Array.from({
              length: FEATURE_COUNT,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
                <div
                  className={`h-4 rounded bg-slate-200 ${
                    index % 2 === 0
                      ? "w-4/5"
                      : "w-3/4"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 h-14 w-full rounded-xl bg-slate-200" />

        <div className="mx-auto mt-5 h-4 w-52 max-w-full rounded bg-slate-100" />
      </div>
    </OnboardingShell>
  );
}