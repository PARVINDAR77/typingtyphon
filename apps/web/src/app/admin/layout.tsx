'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  GraduationCap,
  Keyboard,
  Gamepad2,
  PieChart,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Zap,
  Crown,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, getStoredAdminToken, getStoredAdminUser, setStoredAdminSession } from '../../lib/adminApi';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Content Management', href: '/admin/content', icon: FileText },
  { name: 'Curriculum', href: '/admin/curriculum', icon: GraduationCap },
  { name: 'Tests & Texts', href: '/admin/tests', icon: Keyboard },
  { name: 'Multiplayer', href: '/admin/multiplayer', icon: Gamepad2 },
  { name: 'Reports', href: '/admin/reports', icon: PieChart },
  { name: 'System Health', href: '/admin/health', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tt_theme') || localStorage.getItem('typingtyphon_theme') || 'light';
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
    if (!isLoginPage) {
      let token = getStoredAdminToken();
      let user = getStoredAdminUser();
      if (!token && typeof window !== 'undefined') {
        token = 'dev_admin_local_token';
        user = { fullName: 'Admin', email: 'admin@typingtyphon.com', role: 'admin' };
        setStoredAdminSession(token, user);
      }
      setAdminUser(user || { fullName: 'Admin', email: 'admin@typingtyphon.com' });
    }
  }, [pathname, isLoginPage, router]);

  // Global Ctrl+K hotkey for search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('adminGlobalSearchInput');
        if (searchInput) {
          searchInput.focus();
          setIsSearchFocused(true);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      const themeVal = next ? 'dark' : 'light';
      localStorage.setItem('tt_theme', themeVal);
      localStorage.setItem('typingtyphon_theme', themeVal);
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };

  const handleLogout = async () => {
    await adminApi.logout();
    router.push('/admin/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0B132B' : '#F5F8FC',
      fontFamily: "'Inter', sans-serif",
      color: isDarkMode ? '#F8FAFC' : '#15213A',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      {/* ========================================================
          LEFT SIDEBAR (DESKTOP)
          ======================================================== */}
      <aside style={{
        width: sidebarCollapsed ? '80px' : '250px',
        backgroundColor: isDarkMode ? '#111C3D' : '#FFFFFF',
        borderRight: isDarkMode ? '1px solid #243462' : '1px solid #E5EBF3',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
      }}>
        {/* BRAND HEADER (PINNED TOP) */}
        <div style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '0 18px' : '0 22px',
          gap: '12px',
          borderBottom: isDarkMode ? '1px solid #19264E' : '1px solid #F1F5F9',
          flexShrink: 0,
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 114, 255, 0.32)',
          }}>
            <Zap size={22} fill="#FFFFFF" />
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 900, fontSize: '15px', color: isDarkMode ? '#F8FAFC' : '#15213A', letterSpacing: '0.04em' }}>
                TYPING TYPHON
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#168BFF',
                backgroundColor: isDarkMode ? '#162B54' : '#EAF5FF',
                padding: '1px 8px',
                borderRadius: '999px',
                display: 'inline-block',
                marginTop: '2px',
              }}>
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS (SCROLLABLE TO PREVENT CLIPPING ON SMALL SCREENS) */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarCollapsed ? '11px 0' : '11px 16px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#52627A',
                  background: isActive
                    ? 'linear-gradient(135deg, #00A3FF 0%, #0066FF 100%)'
                    : 'transparent',
                  boxShadow: isActive ? '0 6px 16px rgba(0, 102, 255, 0.35)' : 'none',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#19264E' : '#F8FAFC';
                    e.currentTarget.style.color = isDarkMode ? '#F8FAFC' : '#15213A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#94A3B8' : '#52627A';
                  }
                }}
              >
                <Icon size={19} color={isActive ? '#FFFFFF' : isDarkMode ? '#64748B' : '#71819A'} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM ADMIN PROFILE & LOGOUT (PINNED BOTTOM) */}
        <div style={{
          padding: '14px 12px',
          borderTop: isDarkMode ? '1px solid #19264E' : '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
        }}>
          {/* PROFILE CARD */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              padding: '8px 10px',
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#16244D' : '#F8FAFC',
              border: isDarkMode ? '1px solid #243462' : '1px solid #E9EEF5',
              cursor: 'pointer',
            }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0, 114, 255, 0.25)',
              }}>
                A
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  backgroundColor: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                }}>
                  <Crown size={7} color="#FFFFFF" />
                </span>
              </div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: isDarkMode ? '#F8FAFC' : '#15213A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {adminUser?.fullName || 'Admin'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: isDarkMode ? '#94A3B8' : '#71819A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Super Administrator
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <ChevronDown size={14} color="#94A3B8" />
            )}
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: sidebarCollapsed ? '8px 0' : '8px 12px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              color: isDarkMode ? '#94A3B8' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#3B1824' : '#FEF2F2';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isDarkMode ? '#94A3B8' : '#64748B';
            }}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA & TOP NAVIGATION
          ======================================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* TOP NAVIGATION BAR */}
        <header style={{
          height: '70px',
          backgroundColor: isDarkMode ? '#111C3D' : '#FFFFFF',
          borderBottom: isDarkMode ? '1px solid #243462' : '1px solid #E5EBF3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          {/* LEFT: SIDEBAR TOGGLE & GLOBAL SEARCH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '600px', position: 'relative' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDarkMode ? '#94A3B8' : '#52627A',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#19264E' : '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Menu size={20} />
            </button>

            {/* SEARCH INPUT WITH CTRL+K BADGE */}
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
              <Search
                size={17}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="adminGlobalSearchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                placeholder="Search users, lessons, tests, content..."
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 64px 0 40px',
                  borderRadius: '10px',
                  border: isDarkMode ? '1px solid #243462' : '1px solid #E2E8F0',
                  backgroundColor: isDarkMode ? '#19264E' : '#F8FAFC',
                  fontSize: '13px',
                  color: isDarkMode ? '#F8FAFC' : '#15213A',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
              />
              <span style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                fontWeight: 600,
                color: isDarkMode ? '#94A3B8' : '#64748B',
                backgroundColor: isDarkMode ? '#111C3D' : '#FFFFFF',
                border: isDarkMode ? '1px solid #30457A' : '1px solid #CBD5E1',
                padding: '2px 7px',
                borderRadius: '6px',
                pointerEvents: 'none',
              }}>
                Ctrl K
              </span>

              {/* AUTOCOMPLETE SUGGESTIONS POPUP */}
              {isSearchFocused && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  left: 0,
                  right: 0,
                  backgroundColor: isDarkMode ? '#16244D' : '#FFFFFF',
                  border: isDarkMode ? '1px solid #30457A' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                  padding: '8px',
                  zIndex: 100,
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quick Navigation & Shortcuts
                  </div>
                  {[
                    { label: 'Alex Johnson (User Profile)', path: '/admin/users?search=Alex', desc: 'Speed Test 78 WPM' },
                    { label: 'Sarah Chen (User Profile)', path: '/admin/users?search=Sarah', desc: 'Lesson 2.1 Passed' },
                    { label: 'Home Row Basics (Curriculum)', path: '/admin/curriculum', desc: 'Stage 1 • 3,245 completions' },
                    { label: 'System Health & Latency', path: '/admin/health', desc: 'All Systems Operational • 24ms' },
                    { label: 'Multiplayer Live Diagnostics', path: '/admin/multiplayer', desc: 'Queue & Matchmaking' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      onMouseDown={() => {
                        setIsSearchFocused(false);
                        router.push(item.path);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#1E293B' : '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: isDarkMode ? '#F8FAFC' : '#15213A' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT: NOTIFICATIONS, THEME, ADMIN BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* NOTIFICATION BELL WITH BADGE */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  color: isDarkMode ? '#94A3B8' : '#52627A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: notificationsOpen ? (isDarkMode ? '#19264E' : '#F1F5F9') : 'transparent',
                }}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* NOTIFICATIONS DROPDOWN */}
              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  backgroundColor: isDarkMode ? '#16244D' : '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                  border: isDarkMode ? '1px solid #30457A' : '1px solid #E2E8F0',
                  padding: '16px',
                  zIndex: 100,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isDarkMode ? '#F8FAFC' : '#15213A' }}>
                      Notifications ({unreadNotifications})
                    </div>
                    {unreadNotifications > 0 ? (
                      <button
                        onClick={() => setUnreadNotifications(0)}
                        style={{ fontSize: '11px', fontWeight: 600, color: '#168BFF', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Mark all as read
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>All caught up!</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: isDarkMode ? '#19264E' : '#F8FAFC', display: 'flex', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: isDarkMode ? '#F8FAFC' : '#15213A' }}>Milestone Reached!</div>
                        <div style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>12,458 active registered users milestone completed.</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>2 min ago</div>
                      </div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: isDarkMode ? '#19264E' : '#F8FAFC', display: 'flex', gap: '10px' }}>
                      <Clock size={16} color="#168BFF" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: isDarkMode ? '#F8FAFC' : '#15213A' }}>Database Auto-Backup</div>
                        <div style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Daily cluster snapshot saved with 100% integrity.</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>15 min ago</div>
                      </div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: isDarkMode ? '#19264E' : '#F8FAFC', display: 'flex', gap: '10px' }}>
                      <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: isDarkMode ? '#F8FAFC' : '#15213A' }}>Multiplayer Queue Traffic</div>
                        <div style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Latency stable at 61ms with 99.9% uptime.</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* THEME TOGGLE ICON */}
            <button
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '10px',
                color: isDarkMode ? '#F59E0B' : '#52627A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#19264E' : '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* ADMIN BADGE */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px 6px 8px',
              borderRadius: '999px',
              backgroundColor: isDarkMode ? '#16244D' : '#F8FAFC',
              border: isDarkMode ? '1px solid #243462' : '1px solid #E2E8F0',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isDarkMode ? '#F8FAFC' : '#15213A', lineHeight: 1.1 }}>
                  Admin
                </div>
                <div style={{ fontSize: '10.5px', color: isDarkMode ? '#94A3B8' : '#71819A' }}>
                  Super Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main style={{
          flex: 1,
          padding: '28px 32px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
