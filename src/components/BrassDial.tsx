import React, { useRef, useState, useEffect } from 'react';
import { playDialClick } from '../utils/audioSynth';

interface BrassDialProps {
  value: number; // 0 to 59 (minutes) or 0 to 23 (hours)
  max?: number; // default 60
  label: string;
  onChange: (newValue: number) => void;
  soundEnabled?: boolean;
  size?: number; // pixel width
}

export const BrassDial: React.FC<BrassDialProps> = ({
  value,
  max = 60,
  label,
  onChange,
  soundEnabled = true,
  size = 110,
}) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef(0);

  // Angle in degrees: 0 to 360
  const angle = (value / max) * 360;

  const calculateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const deg = calculateAngleFromPointer(e.clientX, e.clientY);
    lastAngleRef.current = deg;
    const step = Math.round((deg / 360) * max) % max;
    if (step !== value) {
      if (soundEnabled) playDialClick();
      onChange(step);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deg = calculateAngleFromPointer(e.clientX, e.clientY);
    const step = Math.round((deg / 360) * max) % max;
    if (step !== value) {
      if (soundEnabled) playDialClick();
      onChange(step);
      lastAngleRef.current = deg;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const stepForward = () => {
    if (soundEnabled) playDialClick();
    onChange((value + 1) % max);
  };

  const stepBackward = () => {
    if (soundEnabled) playDialClick();
    onChange((value - 1 + max) % max);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Label above dial */}
      <div className="text-[10px] uppercase tracking-widest font-serif text-[#d6b05e] mb-1 font-bold drop-shadow-xs">
        {label}
      </div>

      {/* Dial Assembly Container */}
      <div className="relative p-2 rounded-full bg-gradient-to-b from-[#1b0d05] to-[#3a1d0b] border-2 border-[#543011] shadow-2xl">
        {/* Outer Beveled Brass Bezel Ring with Ticks */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ width: size, height: size }}
          className="relative rounded-full cursor-grab active:cursor-grabbing p-2.5 flex items-center justify-center transition-transform shadow-inner"
        >
          {/* Dial Face with radial brass sheen */}
          <div className="absolute inset-0 rounded-full brass-dial-face border border-[#523706] shadow-md pointer-events-none" />

          {/* Knurled Outer Edge */}
          <div className="absolute inset-1 rounded-full brass-knurl opacity-35 pointer-events-none" />

          {/* Hour/Minute Radial Tick Marks */}
          <div className="absolute inset-2 rounded-full pointer-events-none">
            {[0, 15, 30, 45].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 flex justify-center items-start"
                style={{ transform: `rotate(${deg * 6}deg)` }}
              >
                <div className="w-0.5 h-2 bg-[#422804] rounded-full opacity-80" />
              </div>
            ))}
          </div>

          {/* Rotating Brass Center Knob with Pointer Needle */}
          <div
            className="relative z-10 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-[#f8e998] via-[#cca33b] to-[#754f0a] border-2 border-[#583804] shadow-lg flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Concentric brushed rings inside knob */}
            <div className="w-4/5 h-4/5 rounded-full border border-[#fef7b5]/50 flex items-center justify-center shadow-inner">
              <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-[#583606] to-[#af872a] shadow-xs flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#351e04]" />
              </div>
            </div>

            {/* Brass Indicator Arrow / Notch */}
            <div className="absolute -top-1 w-2.5 h-3 bg-[#241303] clip-triangle border-t border-[#ffe680] shadow-sm transform -translate-y-0.5" />
          </div>
        </div>

        {/* Quick Stepper Buttons below Dial */}
        <div className="flex items-center justify-between mt-1 px-1">
          <button
            onClick={stepBackward}
            title="Step Back"
            aria-label={`Step back ${label}`}
            className="w-5 h-5 rounded-full bg-[#2a1608] hover:bg-[#4a280e] border border-[#a87f2b] text-[#ffd978] text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-sm"
          >
            -
          </button>
          <span className="font-mono text-xs font-bold text-[#f7e098] px-1.5 py-0.5 rounded bg-[#160c04] border border-[#7d5617]">
            {value.toString().padStart(2, '0')}
          </span>
          <button
            onClick={stepForward}
            title="Step Forward"
            aria-label={`Step forward ${label}`}
            className="w-5 h-5 rounded-full bg-[#2a1608] hover:bg-[#4a280e] border border-[#a87f2b] text-[#ffd978] text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-sm"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
