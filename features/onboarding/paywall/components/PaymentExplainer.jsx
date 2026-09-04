import Image from "next/image";

const ICONS = [
  { id: "python", src: "/onboarding/figma/icons/support-icon.svg", alt: "Python" },
  { id: "pinecone", src: "/onboarding/figma/icons/pinecone-icon.svg", alt: "Pinecone" },
  { id: "database", src: "/onboarding/figma/icons/database-icon.svg", alt: "Database" },
  { id: "git", src: "/onboarding/figma/icons/git-branch-icon.svg", alt: "Git" },
];

export default function PaymentExplainer() {
  const stages = [
    {
      id: "today",
      label: "Today",
      description:
        "Pay once, unlock everything immediately. Start Week\u00a01 right now.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      lineActive: true,
    },
    {
      id: "every_cycle",
      label: "Every cycle",
      description:
        "Renews automatically on, depending on plan so your roadmap never gets interrupted.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      ),
      lineActive: true,
    },
    {
      id: "anytime",
      label: "Anytime",
      description:
        'Cancel in one tap from settings. No calls, no forms, no \u201care you sure\u201d runaround.',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
      lineActive: false,
    },
  ];

  return (
    <div className="mt-8">
      {/* Figma Payment Explainer Icons */}
      <style>{`
        @keyframes py-icon-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .py-icon-1 { animation: py-icon-enter 400ms ease-out both; }
        .py-icon-2 { animation: py-icon-enter 400ms ease-out 100ms both; }
        .py-icon-3 { animation: py-icon-enter 400ms ease-out 200ms both; }
        .py-icon-4 { animation: py-icon-enter 400ms ease-out 300ms both; }

        @media (prefers-reduced-motion: reduce) {
          .py-icon-1, .py-icon-2, .py-icon-3, .py-icon-4 {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="flex justify-center items-center gap-4 sm:gap-6 mb-6 h-12">
        {ICONS.map((icon, index) => (
          <div key={icon.id} className={`py-icon-${index + 1} flex items-center justify-center`}>
            {/* Using img for raw SVGs to avoid fill container issues, sizing with Tailwind */}
            <img
              src={icon.src}
              alt={icon.alt}
              className="w-[34px] h-auto sm:w-[48px] object-contain"
            />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-[#001D32] mb-1 text-center">
        Here&apos;s exactly what you&apos;re paying for.
      </h2>
      <p className="text-sm text-slate-500 text-center mb-8">
        No surprises.
      </p>

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-slate-200 shadow-sm bg-white">
        <Image
          src="/onboarding/payment/payment-explainer.gif"
          alt="Payment Explainer"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex flex-col pl-2">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex gap-5">
            {/* Left: circle + line */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-[#FFDCBC] flex items-center justify-center text-[#001D32] shrink-0">
                {stage.icon}
              </div>
              {i < stages.length - 1 && (
                <div
                  className="w-[3px] flex-grow my-1 rounded-full"
                  style={{
                    background: stage.lineActive
                      ? "#00A9FF"
                      : "#D1D5DB",
                    minHeight: "32px",
                  }}
                />
              )}
            </div>

            {/* Right: label + description */}
            <div className="pb-8">
              <p className="font-bold text-[#001D32] text-base leading-tight mb-1">
                {stage.label}
              </p>
              <p className="text-slate-500 text-sm leading-snug">
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
