'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateTypingPercentile,
  calculateAccuracyPercentile,
  cumulativeStdNormal,
} from '../../lib/profileAnalytics';

interface RelativeSpeedHistogramProps {
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
}

export const RelativeSpeedHistogram: React.FC<RelativeSpeedHistogramProps> = ({
  averageWpm,
  bestWpm,
  averageAccuracy,
  bestAccuracy,
}) => {
  const [metricType, setMetricType] = useState<'speed' | 'accuracy'>('speed');
  const [valueType, setValueType] = useState<'average' | 'top'>('average');

  // Active user values based on toggle selections
  const userScore = useMemo(() => {
    if (metricType === 'speed') {
      return valueType === 'average' ? averageWpm : bestWpm;
    } else {
      return valueType === 'average' ? averageAccuracy : bestAccuracy;
    }
  }, [metricType, valueType, averageWpm, bestWpm, averageAccuracy, bestAccuracy]);

  // Gaussian distribution parameters
  // Speed: mean 42 WPM, std 16 WPM. Min 0, Max 110 WPM.
  // Accuracy: mean 94%, std 4%. Min 76%, Max 100%.
  const { mean, stdDev, minX, maxX, unit, percentile } = useMemo(() => {
    if (metricType === 'speed') {
      const mean = 42;
      const stdDev = 16;
      const pct = calculateTypingPercentile(userScore, mean, stdDev);
      return { mean, stdDev, minX: 0, maxX: 110, unit: 'WPM', percentile: pct };
    } else {
      const mean = 94;
      const stdDev = 4;
      const pct = calculateAccuracyPercentile(userScore, mean, stdDev);
      return { mean, stdDev, minX: 78, maxX: 100, unit: '%', percentile: pct };
    }
  }, [metricType, userScore]);

  // Dimensions of SVG viewBox
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingBottom = 45;
  const paddingTop = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Gaussian probability density function: f(x)
  const gaussianDensity = (x: number, m: number, s: number) => {
    const exponent = -0.5 * Math.pow((x - m) / s, 2);
    return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
  };

  // Peak density at x = mean
  const peakDensity = gaussianDensity(mean, mean, stdDev);

  // Map data coordinate (x, density) to SVG coordinates (px, py)
  const mapCoord = (x: number, density: number) => {
    const clampedX = Math.max(minX, Math.min(maxX, x));
    const px = paddingX + ((clampedX - minX) / (maxX - minX)) * chartWidth;
    const py = paddingTop + chartHeight - (density / peakDensity) * chartHeight * 0.92;
    return { px, py };
  };

  // Generate SVG path for the curve
  const { curvePathD, areaPathD, userXPos, userYPos } = useMemo(() => {
    const steps = 80;
    const points: { px: number; py: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = minX + (i / steps) * (maxX - minX);
      const density = gaussianDensity(x, mean, stdDev);
      points.push(mapCoord(x, density));
    }

    // Build SVG path
    let curvePath = `M ${points[0].px} ${points[0].py}`;
    for (let i = 1; i < points.length; i++) {
      curvePath += ` L ${points[i].px} ${points[i].py}`;
    }

    const baselineY = paddingTop + chartHeight;
    const areaPath = `${curvePath} L ${points[points.length - 1].px} ${baselineY} L ${points[0].px} ${baselineY} Z`;

    // User position on chart
    const userCoord = mapCoord(userScore, gaussianDensity(userScore, mean, stdDev));

    return {
      curvePathD: curvePath,
      areaPathD: areaPath,
      userXPos: userCoord.px,
      userYPos: userCoord.py,
    };
  }, [mean, stdDev, minX, maxX, chartWidth, chartHeight, userScore]);

  // Global typists benchmark ticks
  const ticks = useMemo(() => {
    if (metricType === 'speed') {
      return [
        { val: 10, label: '10' },
        { val: 26, label: '26 (Novice)' },
        { val: 42, label: '42 (Average)' },
        { val: 58, label: '58 (Pro)' },
        { val: 74, label: '74 (Master)' },
        { val: 90, label: '90+' },
      ];
    } else {
      return [
        { val: 80, label: '80%' },
        { val: 85, label: '85%' },
        { val: 90, label: '90%' },
        { val: 94, label: '94% (Avg)' },
        { val: 98, label: '98%' },
        { val: 100, label: '100%' },
      ];
    }
  }, [metricType]);

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
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header and Toggle Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              📈 Relative {metricType === 'speed' ? 'Typing Speed' : 'Typing Accuracy'}
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
              Gaussian Bell Curve
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing your performance against global touch typists distribution (μ = {mean}{unit === '%' ? '%' : ' WPM'}, σ = {stdDev}{unit === '%' ? '%' : ' WPM'})
          </p>
        </div>

        {/* Control Pill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Average vs Top Toggle */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.2rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setValueType('average')}
              style={{
                background: valueType === 'average' ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: valueType === 'average' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Average
            </button>
            <button
              onClick={() => setValueType('top')}
              style={{
                background: valueType === 'top' ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: valueType === 'top' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Top (Personal Best)
            </button>
          </div>

          {/* Metric Switch: Speed vs Accuracy */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.2rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setMetricType('speed')}
              style={{
                background: metricType === 'speed' ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'transparent',
                border: 'none',
                color: metricType === 'speed' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Speed (WPM)
            </button>
            <button
              onClick={() => setMetricType('accuracy')}
              style={{
                background: metricType === 'accuracy' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
                border: 'none',
                color: metricType === 'accuracy' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Accuracy (%)
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Keybr Percentile Headline Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '0.75rem',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>🌟</span>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Your {valueType === 'average' ? 'average' : 'top'}{' '}
          {metricType === 'speed' ? 'speed' : 'accuracy'} of{' '}
          <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
            {userScore}{unit === '%' ? '%' : ` ${unit}`}
          </strong>{' '}
          beats{' '}
          <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
            {percentile}%
          </strong>{' '}
          of typists worldwide.
        </div>
      </div>

      {/* SVG Bell Curve Container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '0.5rem 0',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '550px' }}
        >
          <defs>
            {/* Bell curve area gradient */}
            <linearGradient id="bellCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </linearGradient>

            {/* Glowing filter for user pointer */}
            <filter id="glowIndicator" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Baseline horizontal line */}
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingX}
            y2={paddingTop + chartHeight}
            stroke="var(--border-medium)"
            strokeWidth="1.5"
          />

          {/* Bell curve filled polygon */}
          <path d={areaPathD} fill="url(#bellCurveGradient)" />

          {/* Bell curve stroke */}
          <path
            d={curvePathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Benchmark X-axis ticks */}
          {ticks.map((t) => {
            const tx = mapCoord(t.val, 0).px;
            return (
              <g key={t.val}>
                <line
                  x1={tx}
                  y1={paddingTop + chartHeight}
                  x2={tx}
                  y2={paddingTop + chartHeight + 6}
                  stroke="var(--border-medium)"
                  strokeWidth="1.5"
                />
                <text
                  x={tx}
                  y={paddingTop + chartHeight + 20}
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                  textAnchor="middle"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Mean Center reference dashed line */}
          {(() => {
            const mx = mapCoord(mean, peakDensity).px;
            return (
              <line
                x1={mx}
                y1={paddingTop}
                x2={mx}
                y2={paddingTop + chartHeight}
                stroke="var(--border-medium)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })()}

          {/* USER Indicator Line & Dot */}
          {userScore > 0 && (
            <g filter="url(#glowIndicator)">
              {/* Vertical line from baseline to user's point */}
              <line
                x1={userXPos}
                y1={paddingTop + 10}
                x2={userXPos}
                y2={paddingTop + chartHeight}
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />

              {/* Glowing point on the curve */}
              <circle
                cx={userXPos}
                cy={userYPos}
                r="6.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* User Callout Pin Header */}
              <g transform={`translate(${Math.max(70, Math.min(svgWidth - 70, userXPos))}, ${paddingTop - 12})`}>
                <rect
                  x="-55"
                  y="-16"
                  width="110"
                  height="22"
                  rx="11"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-1"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  You: {userScore} {unit} ({percentile}%)
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
