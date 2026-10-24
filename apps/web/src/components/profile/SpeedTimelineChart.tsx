'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SpeedProgressPoint } from '../../lib/profileAnalytics';

interface SpeedTimelineChartProps {
  dataPoints: SpeedProgressPoint[];
}

export const SpeedTimelineChart: React.FC<SpeedTimelineChartProps> = ({ dataPoints }) => {
  const [hoveredPoint, setHoveredPoint] = useState<SpeedProgressPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const svgWidth = 840;
  const svgHeight = 260;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Min and max WPM calculations
  const { minWpm, maxWpm } = useMemo(() => {
    if (dataPoints.length === 0) return { minWpm: 0, maxWpm: 100 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of dataPoints) {
      if (p.netWpm < min) min = p.netWpm;
      if (p.grossWpm > max) max = p.grossWpm;
      if (p.netWpm > max) max = p.netWpm;
    }
    const safeMin = Math.max(0, Math.floor(min / 10) * 10 - 10);
    const safeMax = Math.max(60, Math.ceil(max / 10) * 10 + 10);
    return { minWpm: safeMin, maxWpm: safeMax };
  }, [dataPoints]);

  const mapPoint = (idx: number, wpm: number) => {
    const xFraction = dataPoints.length > 1 ? idx / (dataPoints.length - 1) : 0.5;
    const px = paddingLeft + xFraction * chartWidth;
    const yFraction = (wpm - minWpm) / (maxWpm - minWpm || 1);
    const py = paddingTop + chartHeight - yFraction * chartHeight;
    return { px, py };
  };

  const { netPath, grossPath, movingAvgPath, areaPath, coords } = useMemo(() => {
    if (dataPoints.length === 0) {
      return { netPath: '', grossPath: '', movingAvgPath: '', areaPath: '', coords: [] };
    }

    const calculatedCoords = dataPoints.map((p, i) => ({
      point: p,
      net: mapPoint(i, p.netWpm),
      gross: mapPoint(i, p.grossWpm),
      avg: mapPoint(i, p.movingAvgWpm),
    }));

    let netD = `M ${calculatedCoords[0].net.px} ${calculatedCoords[0].net.py}`;
    let grossD = `M ${calculatedCoords[0].gross.px} ${calculatedCoords[0].gross.py}`;
    let avgD = `M ${calculatedCoords[0].avg.px} ${calculatedCoords[0].avg.py}`;

    for (let i = 1; i < calculatedCoords.length; i++) {
      netD += ` L ${calculatedCoords[i].net.px} ${calculatedCoords[i].net.py}`;
      grossD += ` L ${calculatedCoords[i].gross.px} ${calculatedCoords[i].gross.py}`;
      avgD += ` L ${calculatedCoords[i].avg.px} ${calculatedCoords[i].avg.py}`;
    }

    const baselineY = paddingTop + chartHeight;
    const areaD = `${netD} L ${calculatedCoords[calculatedCoords.length - 1].net.px} ${baselineY} L ${calculatedCoords[0].net.px} ${baselineY} Z`;

    return {
      netPath: netD,
      grossPath: grossD,
      movingAvgPath: avgD,
      areaPath: areaD,
      coords: calculatedCoords,
    };
  }, [dataPoints, minWpm, maxWpm, chartWidth, chartHeight]);

  // Horizontal Y-gridlines
  const yTicks = useMemo(() => {
    const step = Math.ceil((maxWpm - minWpm) / 4 / 10) * 10 || 20;
    const ticks: number[] = [];
    for (let w = minWpm; w <= maxWpm; w += step) {
      ticks.push(w);
    }
    return ticks;
  }, [minWpm, maxWpm]);

  if (dataPoints.length < 2) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(14px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.25rem',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>📈</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Typing Speed Progress Chart
        </h3>
        <p style={{ maxWidth: '420px', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Take at least 2 speed tests to plot your live chronological Net WPM, Gross WPM, and moving average progression curve.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
          }}
        >
          <span>⚡ Start Speed Test</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(14px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Title & Legend Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              📈 Typing Speed Over Time
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#0284c7',
                fontWeight: 600,
              }}
            >
              {dataPoints.length} Tests Logged
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sequential performance tracking with moving average trendline
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: '#0284c7' }} />
            <span>Net WPM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #94a3b8' }} />
            <span>Gross WPM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: '#059669' }} />
            <span>5-Test Moving Avg</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '600px' }}
        >
          <defs>
            <linearGradient id="speedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis numbers */}
          {yTicks.map((tickWpm) => {
            const y = mapPoint(0, tickWpm).py;
            return (
              <g key={tickWpm}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  {tickWpm}
                </text>
              </g>
            );
          })}

          {/* Gradient area fill under Net WPM curve */}
          <path d={areaPath} fill="url(#speedAreaGradient)" />

          {/* Gross WPM dashed line */}
          <path
            d={grossPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity={0.6}
          />

          {/* 5-Test Moving Average Line */}
          <path
            d={movingAvgPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Net WPM primary line */}
          <path
            d={netPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {coords.map((c, i) => (
            <g key={i}>
              <circle
                cx={c.net.px}
                cy={c.net.py}
                r="4.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  setHoveredPoint(c.point);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: c.net.px, y: c.net.py });
                }}
                onMouseLeave={() => {
                  setHoveredPoint(null);
                  setTooltipPos(null);
                }}
              />
            </g>
          ))}

          {/* X Axis Ticks */}
          {coords
            .filter((_, idx) => idx === 0 || idx === coords.length - 1 || idx % Math.ceil(coords.length / 6) === 0)
            .map((c, i) => (
              <text
                key={i}
                x={c.net.px}
                y={paddingTop + chartHeight + 20}
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="var(--font-sans)"
                textAnchor="middle"
              >
                {c.point.dateStr}
              </text>
            ))}

          {/* Hover Tooltip Overlay in SVG */}
          {hoveredPoint && tooltipPos && (
            <g transform={`translate(${Math.max(80, Math.min(svgWidth - 80, tooltipPos.x))}, ${Math.max(35, tooltipPos.y - 45)})`}>
              <rect
                x="-70"
                y="-25"
                width="140"
                height="46"
                rx="8"
                fill="var(--bg-card)"
                stroke="var(--brand-primary)"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
              />
              <text x="0" y="-8" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">
                {hoveredPoint.netWpm} Net / {hoveredPoint.grossWpm} Gross WPM
              </text>
              <text x="0" y="10" fill="#10b981" fontSize="10" fontFamily="var(--font-sans)" textAnchor="middle">
                {hoveredPoint.accuracyPct}% Acc • {hoveredPoint.dateStr}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
