export default function OrderingQuestion({ question, value, onChange }) {
  // Initialize with the original items if value is not set or if it's the skip marker
  const items = (Array.isArray(value) && value.length > 0)
    ? value
    : question.items.map(item => item.id);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {items.map((itemId, index) => {
        const itemDef = question.items.find(i => i.id === itemId);
        if (!itemDef) return null;

        return (
          <div key={itemId} className="flex flex-col items-center w-full max-w-[520px]">
            {/* The Node */}
            <div
              className="w-full flex items-center justify-between px-5 py-3.5 bg-[#E5F6FF] rounded-2xl border-2 border-[#00A9FF] shadow-sm relative group"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#00A9FF] flex items-center justify-center">
                <span className="text-[#00A9FF] text-xs font-bold">{index + 1}</span>
              </div>
              <span className="font-bold text-lg text-[#00A9FF] pl-4">{itemDef.label}</span>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Move ${itemDef.label} up`}
                  className="p-2 rounded bg-white border border-[#00A9FF] text-[#00A9FF] hover:bg-[#00A9FF] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${itemDef.label} down`}
                  className="p-2 rounded bg-white border border-[#00A9FF] text-[#00A9FF] hover:bg-[#00A9FF] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Arrow to next node */}
            {index < items.length - 1 && (
              <div className="flex flex-col items-center my-1 text-[#00A9FF]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
