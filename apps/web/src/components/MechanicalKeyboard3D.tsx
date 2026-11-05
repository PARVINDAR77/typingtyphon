'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface MechanicalKeyboard3DProps {
  interactive?: boolean;
  className?: string;
}

export const MechanicalKeyboard3D: React.FC<MechanicalKeyboard3DProps> = ({
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [clickRipples, setClickRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Smooth mouse tracking for interactive 3D perspective tilt & specular glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Subtle 3D tilt: ±10 degrees max
    const tiltX = (0.5 - y) * 14;
    const tiltY = (x - 0.5) * 18;

    setTilt({
      x: tiltX,
      y: tiltY,
      glareX: x * 100,
      glareY: y * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleKeyboardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setClickRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  return (
    <div
      ref={containerRef}
      className={`hero-3d-keyboard-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleKeyboardClick}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        aspectRatio: '16 / 9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* 1. Volumetric Background Spotlight & Nebula Atmosphere */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.28) 0%, rgba(0, 217, 255, 0.08) 50%, transparent 75%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130, 87, 255, 0.3) 0%, rgba(130, 87, 255, 0.08) 50%, transparent 75%)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 2. Interactive 3D Card Container (Tilts smoothly on mouse move) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '24px',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
            : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease',
          boxShadow: isHovered
            ? '0 30px 70px -10px rgba(0, 217, 255, 0.28), 0 20px 50px -10px rgba(130, 87, 255, 0.3)'
            : '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Core Benchmark Photorealistic Keyboard Render (Image 1) */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src="/images/hero-keyboard.jpg"
            alt="Typing Typhon Futuristic 3D Mechanical Keyboard"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 640px"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '24px',
            }}
          />

          {/* Dynamic Interactive Specular Lighting Glare following mouse */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.16) 0%, rgba(0, 217, 255, 0.08) 35%, transparent 65%)`,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              transition: 'opacity 0.2s ease',
              opacity: isHovered ? 1 : 0.4,
            }}
          />

          {/* Subtle Cyber Rim Edge Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              border: '1px solid rgba(120, 160, 255, 0.25)',
              boxShadow: 'inset 0 0 25px rgba(0, 217, 255, 0.15)',
              pointerEvents: 'none',
            }}
          />

          {/* Animated Pulsing Hotspot on Key 'T' (Electric Cyan) */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '46%',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.45) 0%, transparent 70%)',
              filter: 'blur(4px)',
              pointerEvents: 'none',
              animation: 'pulseGlowCyan 2.2s ease-in-out infinite',
            }}
          />

          {/* Animated Pulsing Hotspot on Key 'H' (Electric Violet) */}
          <div
            style={{
              position: 'absolute',
              top: '47%',
              left: '49%',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'radial-gradient(circle, rgba(130, 87, 255, 0.55) 0%, transparent 70%)',
              filter: 'blur(4px)',
              pointerEvents: 'none',
              animation: 'pulseGlowPurple 2.2s ease-in-out infinite 1.1s',
            }}
          />

          {/* Pulsing Light on Spacebar Edge */}
          <div
            style={{
              position: 'absolute',
              bottom: '31%',
              left: '32%',
              width: '180px',
              height: '14px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.45) 30%, rgba(56, 189, 248, 0.6) 50%, rgba(0, 217, 255, 0.45) 70%, transparent)',
              filter: 'blur(3px)',
              pointerEvents: 'none',
              animation: 'spacebarPulse 3s ease-in-out infinite',
            }}
          />

          {/* Interactive Keystroke Click Ripples */}
          {clickRipples.map((ripple) => (
            <div
              key={ripple.id}
              style={{
                position: 'absolute',
                left: ripple.x - 40,
                top: ripple.y - 40,
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid #00D9FF',
                boxShadow: '0 0 20px #00D9FF',
                animation: 'rippleExpand 0.75s ease-out forwards',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Floating 3D Keycap "T" (Top Right with Sin-Wave Hover) */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          right: '8%',
          width: '74px',
          height: '74px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #101D36 0%, #0A1428 100%)',
          border: '2px solid rgba(0, 217, 255, 0.6)',
          boxShadow: '0 15px 35px rgba(0, 217, 255, 0.35), inset 0 0 15px rgba(0, 217, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${Math.sin(tilt.x * 0.1) * 8}px) rotate(14deg)`,
          animation: 'floatKeyT 4s ease-in-out infinite',
          zIndex: 4,
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#00D9FF',
            textShadow: '0 0 15px #00D9FF',
          }}
        >
          T
        </span>
      </div>

      {/* 4. Floating 3D Keycap "R" (Top Center Left with Counter Hover) */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          left: '12%',
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #1A1036 0%, #0E0A24 100%)',
          border: '2px solid rgba(130, 87, 255, 0.6)',
          boxShadow: '0 12px 30px rgba(130, 87, 255, 0.35), inset 0 0 12px rgba(130, 87, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-16deg)',
          animation: 'floatKeyR 4.8s ease-in-out infinite 1.2s',
          zIndex: 4,
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#8257FF',
            textShadow: '0 0 12px #8257FF',
          }}
        >
          R
        </span>
      </div>

      {/* 5. Keyframes & Animation Styles */}
      <style jsx>{`
        @keyframes pulseGlowCyan {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.35);
          }
        }
        @keyframes pulseGlowPurple {
          0%, 100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.35);
          }
        }
        @keyframes spacebarPulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
            filter: blur(4px) drop-shadow(0 0 8px #00D9FF);
          }
        }
        @keyframes floatKeyT {
          0%, 100% {
            transform: translateY(0px) rotate(14deg);
          }
          50% {
            transform: translateY(-12px) rotate(18deg);
          }
        }
        @keyframes floatKeyR {
          0%, 100% {
            transform: translateY(0px) rotate(-16deg);
          }
          50% {
            transform: translateY(-10px) rotate(-12deg);
          }
        }
        @keyframes rippleExpand {
          0% {
            transform: scale(0.2);
            opacity: 1;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
