import React from "react"
import Shuffle from "@/components/ui/shuffle";
import { NumberTicker } from "@/components/ui/number-ticker"

export default function Loader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#e8e8f0' }}>
            {/* Center - Ignitio text */}
            <div className="flex items-center justify-center">
                <Shuffle
                    shuffleDirection="left"
                    ease="power2.out"
                    loop
                    triggerOnHover={false}
                    text="Ignitio"
                    duration={1.5}
                    className="text-secondary-foreground font-[family-name:var(--font-pixelify)] normal-case text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold"
                />
            </div>

            {/* Bottom Right - Number Ticker */}
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-12 lg:right-12">
                <NumberTicker
                    value={100}
                    className="text-2xl normal-case sm:text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-pixelify)] font-semibold tracking-tighter text-secondary-foreground"
                />
            </div>
        </div>
    );
}
