'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '../../../lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@typingtyphon.com');
  const [password, setPassword] = useState('Admin@Typhon2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await adminApi.login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#EFF5FC',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(205, 228, 255, 0.7) 0px, transparent 55%),
        radial-gradient(at 100% 0%, rgba(218, 235, 255, 0.75) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(225, 240, 255, 0.7) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(215, 232, 255, 0.7) 0px, transparent 50%)
      `,
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* SOFT AMBIENT GLOW ORBS IN CORNERS */}
      <div style={{
        position: 'absolute',
        top: '-12%',
        left: '-8%',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(170, 215, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-12%',
        right: '-8%',
        width: '560px',
        height: '560px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186, 222, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* ========================================================
          CENTERED HERO CARD (FILLS SCREEN PROPORTIONALLY)
          ======================================================== */}
      <div style={{
        width: '95vw',
        maxWidth: '1260px',
        height: '92vh',
        maxHeight: '800px',
        minHeight: '620px',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        boxShadow: '0 25px 80px -15px rgba(22, 139, 255, 0.16), 0 0 0 1px rgba(225, 233, 243, 0.9)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* ========================================================
            LEFT HALF - AUTHENTICATION FORM
            ======================================================== */}
        <div style={{
          flex: '0 0 44%',
          maxWidth: '520px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '36px 44px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5EAF2',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: '370px' }}>
            {/* BRAND HEADER (CENTERED) */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(0, 114, 255, 0.3)',
                margin: '0 auto 10px auto',
              }}>
                <Zap size={26} fill="#FFFFFF" />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '18px', color: '#15213A', letterSpacing: '0.04em' }}>
                  TYPING
                </span>
                <span style={{ fontWeight: 900, fontSize: '18px', color: '#168BFF', letterSpacing: '0.04em' }}>
                  TYPHON
                </span>
              </div>

              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#168BFF',
                  backgroundColor: '#EAF5FF',
                  padding: '2px 12px',
                  borderRadius: '999px',
                  display: 'inline-block',
                  marginTop: '4px',
                }}>
                  Admin Panel
                </span>
              </div>
            </div>

            {/* HEADINGS */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 6px 0',
                letterSpacing: '-0.03em',
              }}>
                Welcome Back<span style={{ color: '#168BFF' }}>.</span>
              </h1>
              <p style={{
                fontSize: '13.5px',
                color: '#64748B',
                margin: 0,
              }}>
                Sign in to your Typing Typhon admin panel
              </p>
            </div>

            {/* ERROR ALERT */}
            {errorMessage && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: '#DC2626',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <ShieldCheck size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px 0 46px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#168BFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(22, 139, 255, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 46px 0 46px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#168BFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(22, 139, 255, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER & FORGOT */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                fontSize: '13px',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0F172A', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '17px',
                      height: '17px',
                      accentColor: '#168BFF',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password recovery requests must be submitted directly to the Chief Security Officer.');
                  }}
                  style={{
                    color: '#168BFF',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'linear-gradient(135deg, #0077FE 0%, #005CE6 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 22px -3px rgba(0, 114, 255, 0.42)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight size={17} />
              </button>

              {/* OR CONTINUE WITH DIVIDER */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '18px 0',
                color: '#94A3B8',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                <span style={{ padding: '0 12px' }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              </div>

              {/* GOOGLE SIGN IN */}
              <button
                type="button"
                onClick={() => {
                  alert('Admin single sign-on requires an active corporate Google Workspace domain configuration.');
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>

            {/* BOTTOM NOTICE */}
            <p style={{
              textAlign: 'center',
              fontSize: '11.5px',
              color: '#94A3B8',
              marginTop: '20px',
              marginBottom: 0,
            }}>
              Only authorized administrators can access this panel.
            </p>
          </div>
        </div>

        {/* ========================================================
            RIGHT HALF - IMMERSIVE 2X ARTWORK HERO (FILLS COMPLETELY)
            ======================================================== */}
        <div style={{
          flex: '1 1 0',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#DCEBFE',
        }}>
          <img
            src="/admin/hero-panel-2x.webp"
            alt="Typing Typhon Admin Platform - Manage. Monitor. Grow."
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
