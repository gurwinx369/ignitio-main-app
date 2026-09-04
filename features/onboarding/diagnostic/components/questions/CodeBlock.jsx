export default function CodeBlock({ code }) {
  if (!code) return null;

  return (
    <div className="rounded-[14px] overflow-hidden mb-4 border border-slate-200 shadow-sm mx-2">
      <div className="bg-[#F1F5F9] px-4 h-10 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2 w-16">
          <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
        </div>
        <div className="text-[13px] font-semibold text-slate-500">
          Exercise
        </div>
        <div className="w-16"></div> {/* Spacer for perfect centering */}
      </div>
      <div className="bg-white p-4 overflow-x-auto">
        <pre className="text-[#334155] font-mono text-sm leading-relaxed whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
