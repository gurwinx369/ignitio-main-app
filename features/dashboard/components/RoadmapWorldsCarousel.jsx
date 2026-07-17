import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RoadmapWorldsCarousel({ roadmaps, initialActiveId }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialActiveId && roadmaps.length > 0) {
      const idx = roadmaps.findIndex(r => r.id === initialActiveId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialActiveId, roadmaps]);

  if (!roadmaps || roadmaps.length === 0) return null;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % roadmaps.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + roadmaps.length) % roadmaps.length);
  };

  return (
    <section className="mb-12 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Roadmap Worlds</h2>
          <p className="text-sm text-slate-500 mt-1">Explore structured learning paths built like game worlds.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={next}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile: one active card stacked normally */}
      <div className="sm:hidden flex flex-col items-center">
        <div className="w-full max-w-[760px] mx-auto">
          {roadmaps[currentIndex].component}
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={prev} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-500">{currentIndex + 1} / {roadmaps.length}</span>
          <button onClick={next} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop: Carousel */}
      <div className="hidden sm:flex justify-center relative w-full overflow-x-clip">
        <div className="flex items-center justify-center w-full max-w-[1200px] relative py-8">
          {/* Invisible active card to define height naturally without clipping */}
          <div className="w-full max-w-[760px] invisible pointer-events-none">
            {roadmaps[currentIndex].component}
          </div>

          {roadmaps.map((item, idx) => {
            let relativeIndex = idx - currentIndex;
            // Handle wrapping for infinite loop effect
            if (relativeIndex < -1 * Math.floor(roadmaps.length / 2)) {
              relativeIndex += roadmaps.length;
            } else if (relativeIndex > Math.floor(roadmaps.length / 2)) {
              relativeIndex -= roadmaps.length;
            }

            if (relativeIndex < -1 || relativeIndex > 1) {
              return (
                <div key={idx} className="absolute inset-x-0 top-8 opacity-0 pointer-events-none transition-all duration-500 flex justify-center">
                  <div className="scale-75 w-full max-w-[760px]">
                    {item.component}
                  </div>
                </div>
              );
            }

            const isCenter = relativeIndex === 0;
            const translateX = relativeIndex * 55; // 55% offset for wider side previews
            const scale = isCenter ? 1 : 0.85; // 0.85 instead of 0.75 for better readability
            const opacity = isCenter ? 1 : 0.4;
            const zIndex = isCenter ? 10 : 0;

            return (
              <div 
                key={idx} 
                className="absolute inset-x-0 top-8 transition-all duration-500 ease-out flex justify-center pointer-events-none"
                style={{
                  transform: `translateX(${translateX}%) scale(${scale})`,
                  opacity,
                  zIndex
                }}
              >
                <div 
                  className={`w-full max-w-[760px] pointer-events-auto transition-all duration-500 ${!isCenter ? 'cursor-pointer hover:opacity-100 hover:scale-105' : ''}`}
                  onClick={() => {
                    if (!isCenter) setCurrentIndex(idx);
                  }}
                >
                  <div className={!isCenter ? "pointer-events-none" : ""}>
                    {item.component}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
