'use client';

import React from 'react';
import { FileText, Plus, Search, Edit3 } from 'lucide-react';

export default function AdminContentPage() {
  const articles = [
    { id: '1', title: 'Home Row Master Guide: Touch Typing Secrets', status: 'Published', views: '28,450', updated: 'Oct 24, 2024' },
    { id: '2', title: 'Ergonomic Hand Positioning to Prevent RSI', status: 'Published', views: '15,120', updated: 'Oct 18, 2024' },
    { id: '3', title: 'Breaking the 100 WPM Barrier: Training Regimens', status: 'Draft', views: '0', updated: 'Oct 28, 2024' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', margin: '0 0 4px 0' }}>
            Content Management
          </h1>
          <p style={{ fontSize: '14px', color: '#71819A', margin: 0 }}>
            Manage educational articles, touch-typing guides, and informational pages
          </p>
        </div>

        <button
          onClick={() => alert('New article draft initiated.')}
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
          <span>New Article</span>
        </button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E1E9F3', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E1E9F3' }}>
              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A' }}>Article Title</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Total Readers</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Last Modified</th>
              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#15213A' }}>{a.title}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: a.status === 'Published' ? '#ECFDF5' : '#FFFBEB',
                    color: a.status === 'Published' ? '#059669' : '#D97706',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#52627A' }}>{a.views}</td>
                <td style={{ padding: '16px 20px', color: '#71819A' }}>{a.updated}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#168BFF', fontWeight: 600, cursor: 'pointer' }}>
                    Edit
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
