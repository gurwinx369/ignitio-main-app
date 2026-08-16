export default function SingleChoiceQuestion({ question, value, onChange }) {
  return (
    <div className="space-y-4">
      {question.options.map((option) => (
        <label
          key={option.value}
          className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
            value === option.value
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === option.value ? "border-blue-600" : "border-gray-300"
            }`}>
              {value === option.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </div>
            <input
              type="radio"
              name={question.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className={`font-medium ${value === option.value ? "text-blue-900" : "text-gray-700"}`}>
              {option.label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
