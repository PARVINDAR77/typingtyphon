import React from 'react';
import { RaceGameMode } from '../../engine/RaceEngine';

interface VehicleSpriteProps {
  mode: RaceGameMode;
  color: string;
  width?: number;
  height?: number;
  isNitro?: boolean;
}

export const VehicleSprite: React.FC<VehicleSpriteProps> = ({
  mode,
  color,
  width = 54,
  height = 28,
  isNitro = false,
}) => {
  if (mode === 'cyberdrift') {
    // Futuristic Cyber Hovercraft
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isNitro ? `drop-shadow(0 0 8px ${color}) drop-shadow(-8px 0 12px #38bdf8)` : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Thruster exhaust trail */}
        <polygon points="2,16 14,11 14,21" fill={isNitro ? '#38bdf8' : '#0ea5e9'} opacity={isNitro ? '0.9' : '0.6'}>
          <animate attributeName="points" dur="0.2s" repeatCount="indefinite" values="2,16 14,11 14,21; 0,16 14,12 14,20; 2,16 14,11 14,21" />
        </polygon>
        {/* Main Body */}
        <path
          d="M12 10 L44 8 L60 16 L44 24 L12 22 L16 16 Z"
          fill={color}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />
        {/* Cockpit canopy */}
        <polygon points="26,12 42,12 48,16 38,18 26,16" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        {/* Glowing wing tip */}
        <circle cx="14" cy="9" r="2" fill="#38bdf8" />
        <circle cx="14" cy="23" r="2" fill="#38bdf8" />
        {/* Side thruster fins */}
        <path d="M22 6 L32 9 L24 10 Z" fill={color} />
        <path d="M22 26 L32 23 L24 22 Z" fill={color} />
      </svg>
    );
  }

  if (mode === 'wordrush') {
    // Word Rush Hydro-Skimmer / Dragster
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isNitro ? 'drop-shadow(0 0 8px #f59e0b) drop-shadow(-8px 0 10px #f43f5e)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      >
        {/* Nitro flame */}
        <polygon points="0,16 12,12 12,20" fill={isNitro ? '#f59e0b' : '#f97316'} opacity="0.85">
          <animate attributeName="points" dur="0.18s" repeatCount="indefinite" values="0,16 12,12 12,20; 3,16 12,13 12,19; 0,16 12,12 12,20" />
        </polygon>
        {/* Aerodynamic hull */}
        <path
          d="M12 13 L36 9 L58 15 L62 16 L58 17 L36 23 L12 19 Z"
          fill={color}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />
        {/* Cockpit visor */}
        <polygon points="30,13 46,13 52,16 46,17 30,17" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
        {/* Rear stabilizer */}
        <rect x="14" y="6" width="4" height="20" rx="1" fill="#0f172a" />
      </svg>
    );
  }

  // Classic Keybr Supercar
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isNitro ? 'drop-shadow(0 0 8px #38bdf8)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
      }}
    >
      {/* Spoiler */}
      <path d="M4 11 L10 11 L12 15 L6 15 Z" fill="#0f172a" />
      <rect x="7" y="14" width="2" height="4" fill="#0f172a" />

      {/* Main Car Body */}
      <path
        d="M8 18 Q10 13 22 13 L32 8 Q38 8 46 12 L56 16 Q60 17 60 21 L58 24 Q57 25 54 25 L10 25 Q8 25 8 22 Z"
        fill={color}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.2"
      />

      {/* Cabin Window / Windshield */}
      <path
        d="M24 14 L33 9.5 Q37 9.5 44 13 L36 15 L25 15 Z"
        fill="#0f172a"
        stroke="rgba(56, 189, 248, 0.6)"
        strokeWidth="1"
      />

      {/* Headlight */}
      <polygon points="56,18 60,19 59,21 55,20" fill="#fef08a" />

      {/* Wheels */}
      {/* Rear Wheel */}
      <circle cx="16" cy="24" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="16" cy="24" r="2.5" fill="#e2e8f0" />

      {/* Front Wheel */}
      <circle cx="48" cy="24" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="48" cy="24" r="2.5" fill="#e2e8f0" />
    </svg>
  );
};
