'use client';



/**
 * C++ Stdin Input Component
 * A responsive textarea for entering input values to test C++ code
 */
export default function StdinInput({ value, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-white border border-[#f0caa8] flex flex-col shadow-md">
      {/* Header */}
      <div className=".flex-shrink-0 flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border-b border-[#f0caa8] bg-[#fcf5ee]">
        <span className="text-[10px] sm:text-xs font-semibold text-[#19183b] uppercase tracking-wide">
          INPUT
        </span>
      </div>

      {/* Input content */}
      <div className="flex-1 bg-white">
        <textarea
          className="w-full min-h-[80px] p-2 sm:p-3 md:p-4 bg-transparent font-mono text-[11px] sm:text-xs md:text-sm text-[#19183b] placeholder-[#5a5892]/50 outline-none resize-y block"
          value={value}
          onChange={handleChange}
          placeholder="Enter stdin input values here (separated by spaces or newlines)..."
        />
      </div>
    </div>
  );
}
