'use client';

import React from 'react';
import { Trophy, Users, Wifi, ShieldAlert } from 'lucide-react';

export default function AdminMultiplayerPage() {
  const races = [
    { id: 'race-891', track: 'Cyber Neon Circuit', participants: 4, status: 'In Progress', topSpeed: '84 WPM' },
    { id: 'race-890', track: 'Solar Flare Track', participants: 5, status: 'Completed', topSpeed: '102 WPM' },
    { id: 'race-889', track: 'Midnight Sprint', participants: 3, status: 'Completed', topSpeed: '76 WPM' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', margin: '0 0 4px 0' }}>
          Multiplayer Arena Administration
        </h1>
        <p style={{ fontSize: '14px', color: '#71819A', margin: 0 }}>
          Monitor live racing lobbies, participant connections, and fair play validation
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E1E9F3' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>Active Lobbies</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#168BFF' }}>14</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E1E9F3' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>Racers Online</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>52</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E1E9F3' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>Races Completed (24h)</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8B5CF6' }}>1,842</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E1E9F3' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#71819A', marginBottom: '8px' }}>Fair-Play Flags</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>0 Active</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E1E9F3', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E1E9F3', fontWeight: 800, fontSize: '16px' }}>
          Live & Recent Race Sessions
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E1E9F3' }}>
              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A' }}>Race Session ID</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Race Track</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Participants</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Top Speed</th>
            </tr>
          </thead>
          <tbody>
            {races.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#15213A' }}>{r.id}</td>
                <td style={{ padding: '16px 20px', color: '#52627A' }}>{r.track}</td>
                <td style={{ padding: '16px 20px', color: '#52627A' }}>{r.participants} Racers</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: r.status === 'In Progress' ? '#ECFDF5' : '#F1F5F9',
                    color: r.status === 'In Progress' ? '#059669' : '#64748B',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: '#168BFF' }}>{r.topSpeed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
