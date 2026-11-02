'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Activity,
  Clock,
  CheckCircle,
  Globe,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'performance' | 'retention' | 'geography'>('overview');

  const countries = [
    { name: 'United States', pct: 29, count: 3612 },
    { name: 'India', pct: 18, count: 2242 },
    { name: 'United Kingdom', pct: 12, count: 1494 },
    { name: 'Canada', pct: 8, count: 996 },
    { name: 'Australia', pct: 5, count: 622 },
    { name: 'Other Countries', pct: 28, count: 3492 },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ========================================================
          HEADER & TABS
          ======================================================== */}
      <div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#15213A',
          margin: '0 0 4px 0',
          letterSpacing: '-0.02em',
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: '14px', color: '#71819A', margin: '0 0 20px 0' }}>
          Detailed insights and performance metrics
        </p>

        {/* TABS */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E1E9F3',
          paddingBottom: '2px',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'User Analytics' },
            { id: 'performance', label: 'Performance' },
            { id: 'retention', label: 'Retention' },
            { id: 'geography', label: 'Geography' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  backgroundColor: isActive ? '#EAF5FF' : 'transparent',
                  color: isActive ? '#168BFF' : '#52627A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #168BFF' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4 TOP SUMMARY METRICS
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #E1E9F3',
          boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>
            Daily Active Users
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15213A', marginBottom: '6px' }}>
            842
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <ArrowUpRight size={14} />
            <span>+18% from last month</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #E1E9F3',
          boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>
            Tests Today
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15213A', marginBottom: '6px' }}>
            3,241
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <ArrowUpRight size={14} />
            <span>+24% from yesterday</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #E1E9F3',
          boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>
            Avg. Test Duration
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15213A', marginBottom: '6px' }}>
            56s
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <ArrowUpRight size={14} />
            <span>+4% consistency</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #E1E9F3',
          boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>
            Completion Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15213A', marginBottom: '6px' }}>
            78%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <ArrowUpRight size={14} />
            <span>+12% pass accuracy</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          DAILY ACTIVITY BAR CHART
          ======================================================== */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '26px',
        border: '1px solid #E1E9F3',
        boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#15213A', margin: 0 }}>
            Daily Activity
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#52627A' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#00D2D3' }} />
              <span>New Users</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#52627A' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#168BFF' }} />
              <span>Active Users</span>
            </div>
          </div>
        </div>

        {/* SVG BARS */}
        <div style={{ width: '100%', height: '220px' }}>
          <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%' }}>
            {/* Grid lines */}
            <line x1="30" y1="30" x2="680" y2="30" stroke="#F1F5F9" />
            <text x="25" y="34" fill="#94A3B8" fontSize="10" textAnchor="end">1.5K</text>
            <line x1="30" y1="90" x2="680" y2="90" stroke="#F1F5F9" />
            <text x="25" y="94" fill="#94A3B8" fontSize="10" textAnchor="end">1K</text>
            <line x1="30" y1="150" x2="680" y2="150" stroke="#F1F5F9" />
            <text x="25" y="154" fill="#94A3B8" fontSize="10" textAnchor="end">500</text>
            <line x1="30" y1="180" x2="680" y2="180" stroke="#E1E9F3" />
            <text x="25" y="184" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

            {/* Daily Bars */}
            {[
              { day: 'Oct 1', activeH: 60, newH: 25 },
              { day: 'Oct 3', activeH: 75, newH: 30 },
              { day: 'Oct 5', activeH: 90, newH: 40 },
              { day: 'Oct 7', activeH: 80, newH: 35 },
              { day: 'Oct 10', activeH: 110, newH: 50 },
              { day: 'Oct 12', activeH: 100, newH: 45 },
              { day: 'Oct 15', activeH: 130, newH: 60 },
              { day: 'Oct 18', activeH: 120, newH: 55 },
              { day: 'Oct 20', activeH: 150, newH: 70 },
              { day: 'Oct 23', activeH: 140, newH: 65 },
              { day: 'Oct 25', activeH: 160, newH: 75 },
              { day: 'Oct 28', activeH: 155, newH: 70 },
              { day: 'Oct 31', activeH: 165, newH: 80 },
            ].map((col, idx) => {
              const xPos = 60 + idx * 48;
              return (
                <g key={col.day}>
                  {/* Active Users Bar (Blue) */}
                  <rect
                    x={xPos}
                    y={180 - col.activeH}
                    width="14"
                    height={col.activeH}
                    rx="3"
                    fill="#168BFF"
                  />
                  {/* New Users Bar (Cyan) */}
                  <rect
                    x={xPos + 16}
                    y={180 - col.newH}
                    width="14"
                    height={col.newH}
                    rx="3"
                    fill="#00D2D3"
                  />
                  <text x={xPos + 15} y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">
                    {col.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ========================================================
          USER GEOGRAPHY
          ======================================================== */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '26px',
        border: '1px solid #E1E9F3',
        boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#15213A', margin: '0 0 20px 0' }}>
          User Geography
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'center',
        }}>
          {/* MAP PROJECTION (7 OF 12 COLS) */}
          <div style={{
            gridColumn: 'span 7',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
              {/* Simplified stylized world continents */}
              {/* North America */}
              <path d="M 60 80 Q 120 40 180 70 Q 190 130 140 160 Q 80 140 60 80 Z" fill="#C9E5FF" stroke="#168BFF" strokeWidth="1.5" />
              {/* South America */}
              <path d="M 140 180 Q 180 190 170 260 Q 140 290 120 220 Z" fill="#C9E5FF" stroke="#168BFF" strokeWidth="1.5" />
              {/* Europe */}
              <path d="M 280 60 Q 340 50 360 100 Q 310 120 280 60 Z" fill="#C9E5FF" stroke="#168BFF" strokeWidth="1.5" />
              {/* Africa */}
              <path d="M 280 130 Q 360 130 350 220 Q 300 250 270 170 Z" fill="#C9E5FF" stroke="#168BFF" strokeWidth="1.5" />
              {/* Asia */}
              <path d="M 370 60 Q 520 50 510 140 Q 420 180 370 110 Z" fill="#168BFF" fillOpacity="0.4" stroke="#168BFF" strokeWidth="1.5" />
              {/* Australia */}
              <path d="M 460 220 Q 520 210 510 260 Q 460 270 460 220 Z" fill="#C9E5FF" stroke="#168BFF" strokeWidth="1.5" />

              {/* Hotspot Markers */}
              <circle cx="120" cy="100" r="7" fill="#168BFF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="430" cy="130" r="7" fill="#168BFF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="310" cy="80" r="6" fill="#168BFF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="480" cy="240" r="5" fill="#168BFF" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          {/* COUNTRIES LIST & BARS (5 OF 12 COLS) */}
          <div style={{
            gridColumn: 'span 5',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {countries.map((c) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#15213A' }}>{c.name}</span>
                  <span style={{ color: '#168BFF', fontWeight: 700 }}>{c.pct}%</span>
                </div>
                <div style={{ height: '7px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', backgroundColor: '#168BFF' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
