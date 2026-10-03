"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function KiboParticles({ active }) {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Create 15 particles
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const container = containerRef.current;
    
    // Clear previous
    container.innerHTML = '';
    particlesRef.current = [];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-3 h-3 rounded-full blur-[1px] opacity-0';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      // Start in the center
      particle.style.left = '50%';
      particle.style.top = '50%';
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }

    // GSAP animation for explosion
    const tl = gsap.timeline();
    
    particlesRef.current.forEach((p, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 60 + Math.random() * 80;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius - 40; // bias upward
      
      tl.to(p, {
        x: tx,
        y: ty,
        opacity: Math.random() * 0.5 + 0.3,
        scale: Math.random() * 1.5 + 0.5,
        rotation: Math.random() * 360,
        duration: 0.8 + Math.random() * 0.4,
        ease: "power3.out"
      }, 0);
      
      // fade out
      tl.to(p, {
        opacity: 0,
        y: ty + 40,
        duration: 0.5,
        ease: "power1.in"
      }, "-=0.2");
    });

    return () => {
      tl.kill();
      if (container) container.innerHTML = '';
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none -z-10" 
      style={{ perspective: 1000 }}
    />
  );
}
