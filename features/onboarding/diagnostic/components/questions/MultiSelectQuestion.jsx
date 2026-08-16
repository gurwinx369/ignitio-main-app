export default function MultiSelectQuestion({ question, value, onChange }) {
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
    <div className="space-y-4">
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
            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isChecked
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                isChecked ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
              }`}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <span className={`font-medium ${isChecked ? "text-blue-900" : "text-gray-700"}`}>
                {option.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
