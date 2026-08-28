export default function ShortTextQuestion({ question, value, onChange }) {
  // If the value is the skip marker, show an empty string so they don't see "__skipped__"
  const displayValue = value === "__skipped__" ? "" : (value || "");

  return (
    <div>
      <textarea
        className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-[#FFDCBC] bg-white text-[#001D32] text-lg font-medium focus:border-[#4EC3FF] focus:ring-0 resize-y transition-colors placeholder:text-gray-400"
        placeholder="Type your answer here..."
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
