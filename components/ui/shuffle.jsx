"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function Shuffle({
  text = "Text",
  shuffleDirection = "left",
  duration = 1.5,
  ease = "power2.out",
  loop = false,
  triggerOnHover = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
    if (!triggerOnHover) {
      animate();
    }
  }, []);

  const animate = () => {
    let iteration = 0;
    const originalText = text;

    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * 26)];
          })
          .join("")
      );

      if (iteration >= originalText.length) {
        clearInterval(interval);
        if (loop) {
          setTimeout(animate, 1000);
        }
      }

      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={triggerOnHover ? animate : undefined}
    >
      {displayText}
    </span>
  );
}
