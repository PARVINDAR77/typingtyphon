'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  FileText,
  User,
  Key,
  Database,
  Lock,
} from 'lucide-react';
import { adminApi, formatDateDeterministic } from '../../../lib/adminApi';
import { AdminAuditLogItem } from '@typingtyphon/contracts';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'security' | 'profile'>('audit');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAuditLogs();
        setLogs(res);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#15213A', margin: '0 0 4px 0' }}>
          Settings & Governance
        </h1>
        <p style={{ fontSize: '14px', color: '#71819A', margin: '0 0 20px 0' }}>
          Platform security configuration and immutable administrative audit ledger
        </p>

        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E1E9F3',
          paddingBottom: '2px',
        }}>
          {[
            { id: 'audit', label: 'Immutable Audit Ledger' },
            { id: 'security', label: 'Security & Auth Controls' },
            { id: 'profile', label: 'Admin Profile' },
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
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'audit' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E1E9F3',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(22, 139, 255, 0.04)',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E9F3' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#15213A', margin: '0 0 4px 0' }}>
              Privileged Actions Ledger
            </h2>
            <p style={{ fontSize: '13px', color: '#71819A', margin: 0 }}>
              All administrative operations are cryptographically verified and permanently logged.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E1E9F3' }}>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A' }}>Timestamp</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Actor</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Action</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Target</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#71819A' }}>Payload Diff</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: '#71819A' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td suppressHydrationWarning style={{ padding: '14px 24px', color: '#71819A', whiteSpace: 'nowrap' }}>
                      {formatDateDeterministic(log.timestamp)}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#15213A' }}>
                      {log.actorName}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#EAF5FF',
                        color: '#168BFF',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        {log.actionType}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#52627A' }}>
                      {log.targetEntity}: {log.targetId}
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '11px', color: '#52627A', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.diffJson}
                    </td>
                    <td style={{ padding: '14px 24px', color: '#94A3B8' }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '24px', border: '1px solid #E1E9F3' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#15213A', marginBottom: '16px' }}>
            Authentication & Security Policies
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>HttpOnly Admin Cookie Guard</div>
                <div style={{ fontSize: '12px', color: '#71819A' }}>Tokens restricted from JavaScript extraction</div>
              </div>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '12px' }}>ENFORCED</span>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Server-Side Role-Based Authorization</div>
                <div style={{ fontSize: '12px', color: '#71819A' }}>Explicit Role: ADMIN required on every endpoint</div>
              </div>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '12px' }}>ENFORCED</span>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>CSV Formula Injection Sanitization</div>
                <div style={{ fontSize: '12px', color: '#71819A' }}>Escaping leading =, +, -, @ on all exports</div>
              </div>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '12px' }}>ENFORCED</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '24px', border: '1px solid #E1E9F3', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#15213A', marginBottom: '16px' }}>
            Administrator Credentials
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52627A', marginBottom: '6px' }}>Full Name</label>
              <input type="text" readOnly value="System Administrator" style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#15213A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52627A', marginBottom: '6px' }}>Email Address</label>
              <input type="text" readOnly value="admin@typingtyphon.com" style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#15213A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52627A', marginBottom: '6px' }}>Assigned Security Role</label>
              <input type="text" readOnly value="SUPER_ADMIN" style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#168BFF', fontWeight: 700 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
