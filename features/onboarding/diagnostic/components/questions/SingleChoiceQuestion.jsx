"use client";

export default function SingleChoiceQuestion({ question, value, onChange, isGrid = false }) {
  return (
    <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "flex flex-col gap-3"}>
      {question.options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "w-full text-left px-5 py-4 rounded-2xl border-2 cursor-pointer select-none font-semibold text-[15px] leading-snug",
              "transition-[border-color,background-color,box-shadow,transform] duration-100",
              // Duolingo press: translate down + kill shadow on active
              isSelected
                ? "active:translate-y-[3px] active:shadow-none"
                : "active:translate-y-[3px] active:shadow-none",
              isSelected
                ? "border-[#00a9ff] bg-[#ddf2ff] text-[#001d32] shadow-[0_3px_0_#3081AD]"
                : "border-[#e5d5c5] bg-white text-[#1a2a3a] shadow-[0_3px_0_#FFDCBC]",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
