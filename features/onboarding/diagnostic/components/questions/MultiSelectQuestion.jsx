export default function MultiSelectQuestion({ question, value, onChange, isGrid = false }) {
  // Ensure value is always an array
  const currentValues = Array.isArray(value) ? value : [];

  const handleCheckboxChange = (optionValue) => {
    if (optionValue === "none") {
      // "None of these" selected -> clear all, set to empty array
      onChange([]);
      return;
    }

    // Toggle specific technology
    const isSelected = currentValues.includes(optionValue);
    let newValues;

    if (isSelected) {
      newValues = currentValues.filter((v) => v !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    onChange(newValues);
  };

  return (
    <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-5"}>
      {question.options.map((option) => {
        const isNoneOption = option.value === "none";
        // It's checked if it's the 'none' option and the array is empty,
        // or if it's a regular option and its value is in the array.
        // But wait! If `value` is initially `null` (before the user clicks anything),
        // we shouldn't show 'none' as checked.
        // Let's assume if it hasn't been touched, `value` is null, not an empty array.
        const isPristine = value === null || value === undefined;
        const isChecked = isNoneOption
          ? (!isPristine && currentValues.length === 0)
          : currentValues.includes(option.value);

        return (
          <label
            key={option.value}
            className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${isChecked
              ? "border-[#4EC3FF] bg-[#A8E2FF]"
              : "border-[#FFDCBC] bg-white hover:border-[#4EC3FF]"
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${isChecked ? "border-[#00A9FF] bg-[#00A9FF]" : "border-[#FFDCBC] bg-white"
                }`}>
                {isChecked && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                name={question.id}
                value={option.value}
                checked={isChecked}
                onChange={() => handleCheckboxChange(option.value)}
                className="sr-only"
              />
              <span className="text-lg font-bold text-[#001D32]">
                {option.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
