'use client';

import React from 'react';
import { Keyboard, Plus, Search, CheckCircle } from 'lucide-react';

export default function AdminTestsPage() {
  const tests = [
    { id: '1', title: 'Top 200 Most Common English Words', mode: 'Timed (15s, 30s, 60s)', category: 'Core Vocabulary', activePassages: 40 },
    { id: '2', title: 'JavaScript & TypeScript Developer Keywords', mode: 'Code Mode', category: 'Programming', activePassages: 25 },
    { id: '3', title: 'Classic Literature & Scientific Quotes', mode: 'Passages', category: 'General', activePassages: 60 },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', margin: '0 0 4px 0' }}>
            Tests & Texts Management
          </h1>
          <p style={{ fontSize: '14px', color: '#71819A', margin: 0 }}>
            Inspect test passages, manage approved word sets, and configure typing practice modes
          </p>
        </div>

        <button
          onClick={() => alert('New passage set wizard opened.')}
          style={{
            height: '42px',
            padding: '0 18px',
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
          }}
        >
          <Plus size={18} />
          <span>+ Add Text Set</span>
        </button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E1E9F3', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E1E9F3' }}>
              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A' }}>Text Set Name</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Category</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Available Mode</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Passage Count</th>
              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#15213A' }}>{t.title}</td>
                <td style={{ padding: '16px 20px', color: '#52627A' }}>{t.category}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EAF5FF', color: '#168BFF', fontSize: '11px', fontWeight: 700 }}>
                    {t.mode}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#52627A' }}>{t.activePassages} active passages</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#168BFF', fontWeight: 600, cursor: 'pointer' }}>
                    Edit Passages
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
