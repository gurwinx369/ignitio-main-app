export default function ShortTextQuestion({ question, value, onChange }) {
  // If the value is the skip marker, show an empty string so they don't see "__skipped__"
  const displayValue = value === "__skipped__" ? "" : (value || "");

  return (
    <div>
      <textarea
        className="w-full min-h-[120px] p-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-0 resize-y transition-colors"
        placeholder="Type your answer here..."
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
