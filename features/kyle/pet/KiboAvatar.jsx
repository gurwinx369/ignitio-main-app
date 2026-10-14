import React from 'react';
import Image from 'next/image';

export default function KiboAvatar({ width = 40, height = 40, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <img
        src="/kibo/kibo_body.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain"
      />
      <img
        src="/kibo/kibo_eyes.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}
