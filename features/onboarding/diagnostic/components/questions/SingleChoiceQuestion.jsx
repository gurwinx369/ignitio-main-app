export default function SingleChoiceQuestion({ question, value, onChange, isGrid = false }) {
  return (
    <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
      {question.options.map((option) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              isSelected
                ? "border-[#4EC3FF] bg-[#A8E2FF]"
                : "border-[#FFDCBC] bg-white hover:border-[#4EC3FF]"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className={`text-lg font-bold ${isSelected ? "text-[#001D32]" : "text-[#001D32]"}`}>
                {option.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
