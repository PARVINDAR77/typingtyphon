'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { adminApi, formatNumber } from '../../../lib/adminApi';
import { AdminReportData } from '@typingtyphon/contracts';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('usage');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports(reportType, dateRange);
      setReportData(res);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await adminApi.downloadReportsCsv(reportType, dateRange);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const summary = reportData?.summary || {
    newUsers: 3241,
    returningUsers: 842,
    conversionRatePct: 7.1,
    churnRatePct: 2.3,
  };

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
          Reports
        </h1>
        <p style={{ fontSize: '14px', color: '#71819A', margin: '0 0 20px 0' }}>
          Generate and view detailed reports
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
            { id: 'usage', label: 'Usage Reports' },
            { id: 'performance', label: 'Performance Reports' },
            { id: 'users', label: 'User Reports' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'logs', label: 'System Logs' },
          ].map((tab) => {
            const isActive = reportType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
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
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          FILTER & GENERATE CONTROLS
          ======================================================== */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '16px 20px',
        border: '1px solid #E1E9F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#168BFF" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#52627A' }}>Selected Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #E1E9F3',
              backgroundColor: '#F8FAFC',
              fontSize: '13px',
              fontWeight: 600,
              color: '#15213A',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="7d">Oct 24, 2024 - Oct 31, 2024</option>
            <option value="30d">Oct 1, 2024 - Oct 31, 2024</option>
            <option value="90d">Aug 1, 2024 - Oct 31, 2024</option>
          </select>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          style={{
            height: '42px',
            padding: '0 20px',
            borderRadius: '10px',
            backgroundColor: '#168BFF',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(22, 139, 255, 0.25)',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* ========================================================
          USER GROWTH REPORT CARD
          ======================================================== */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '26px',
        border: '1px solid #E1E9F3',
        boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
      }}>
        {/* REPORT HEADER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#15213A', margin: 0 }}>
            User Growth Report
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#52627A' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00D2D3' }} />
                <span>New Users</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#52627A' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#168BFF' }} />
                <span>Total Users</span>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              disabled={exporting}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E1E9F3',
                color: '#168BFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* LINE GRAPH VISUALIZATION */}
        <div style={{ width: '100%', height: '240px', marginBottom: '28px' }}>
          <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="reportBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#168BFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#168BFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="40" y1="30" x2="680" y2="30" stroke="#F1F5F9" strokeDasharray="3 3" />
            <text x="30" y="34" fill="#94A3B8" fontSize="11" textAnchor="end">15K</text>
            <line x1="40" y1="90" x2="680" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
            <text x="30" y="94" fill="#94A3B8" fontSize="11" textAnchor="end">10K</text>
            <line x1="40" y1="150" x2="680" y2="150" stroke="#F1F5F9" strokeDasharray="3 3" />
            <text x="30" y="154" fill="#94A3B8" fontSize="11" textAnchor="end">5K</text>
            <line x1="40" y1="210" x2="680" y2="210" stroke="#E1E9F3" />
            <text x="30" y="214" fill="#94A3B8" fontSize="11" textAnchor="end">0</text>

            <path
              d="M 60 170 C 140 160, 220 145, 300 130 C 380 115, 460 90, 540 75 C 600 65, 640 55, 660 50 L 660 210 L 60 210 Z"
              fill="url(#reportBlueGrad)"
            />
            <path
              d="M 60 170 C 140 160, 220 145, 300 130 C 380 115, 460 90, 540 75 C 600 65, 640 55, 660 50"
              fill="none"
              stroke="#168BFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 60 200 C 140 195, 220 190, 300 185 C 380 180, 460 175, 540 160 C 600 170, 640 165, 660 162"
              fill="none"
              stroke="#00D2D3"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            <text x="60" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 1</text>
            <text x="160" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 5</text>
            <text x="260" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 10</text>
            <text x="360" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 15</text>
            <text x="460" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 20</text>
            <text x="560" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 25</text>
            <text x="660" y="230" fill="#94A3B8" fontSize="11" textAnchor="middle">Oct 31</text>
          </svg>
        </div>

        {/* 4 SUMMARY METRICS AT BOTTOM */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          paddingTop: '20px',
          borderTop: '1px solid #E1E9F3',
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#71819A', marginBottom: '4px' }}>New Users</div>
            <div suppressHydrationWarning style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', marginBottom: '4px' }}>
              {formatNumber(summary.newUsers)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
              <ArrowUpRight size={14} />
              <span>+24%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#71819A', marginBottom: '4px' }}>Returning Users</div>
            <div suppressHydrationWarning style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', marginBottom: '4px' }}>
              {formatNumber(summary.returningUsers)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
              <ArrowUpRight size={14} />
              <span>+18%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#71819A', marginBottom: '4px' }}>Conversion Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', marginBottom: '4px' }}>
              {summary.conversionRatePct}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>
              <ArrowDownRight size={14} />
              <span>-1.2%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#71819A', marginBottom: '4px' }}>Churn Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', marginBottom: '4px' }}>
              {summary.churnRatePct}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
              <ArrowUpRight size={14} />
              <span>+0.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
