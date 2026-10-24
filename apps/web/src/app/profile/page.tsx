'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GuestSessionMigrationItem,
  KeyMetricAggregate,
  UserProfileDto,
} from '@typingtyphon/contracts';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { AuthModal } from '../../components/AuthModal';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileStatsGrid } from '../../components/profile/ProfileStatsGrid';
import { AccuracyStreaksCard } from '../../components/profile/AccuracyStreaksCard';
import { RelativeSpeedHistogram } from '../../components/profile/RelativeSpeedHistogram';
import { KeyMasteryMatrix } from '../../components/profile/KeyMasteryMatrix';
import { SpeedTimelineChart } from '../../components/profile/SpeedTimelineChart';
import { ActivityCalendar } from '../../components/profile/ActivityCalendar';
import {
  getGuestSessions,
  getGuestSessionsAsync,
  getAggregateKeyAnalytics,
  clearGuestSessions,
  seedGuestSessions,
} from '../../lib/storage';
import {
  computeAllTimeAndTodayStats,
  computeAccuracyStreaks,
  computeKeyMasteryMatrix,
  computeSpeedTimeline,
  computeActivityCalendar,
} from '../../lib/profileAnalytics';

export default function ProfilePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GuestSessionMigrationItem[]>([]);
  const [keyAnalytics, setKeyAnalytics] = useState<Record<string, KeyMetricAggregate>>({});
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('login');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load guest sessions and per-key telemetry
  const refreshData = useCallback(() => {
    if (typeof window === 'undefined') return;
    const localSessions = getGuestSessions();
    setSessions(localSessions);
    const localKeys = getAggregateKeyAnalytics();
    setKeyAnalytics(localKeys);

    // Asynchronously sync with IndexedDB if available
    getGuestSessionsAsync().then((asyncSessions) => {
      if (asyncSessions && asyncSessions.length > 0) {
        setSessions(asyncSessions);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compute analytics based on sessions and selected mode
  const stats = useMemo(() => {
    return computeAllTimeAndTodayStats(sessions, selectedMode);
  }, [sessions, selectedMode]);

  const streaks = useMemo(() => {
    return computeAccuracyStreaks(sessions);
  }, [sessions]);

  const keyMasteryRows = useMemo(() => {
    return computeKeyMasteryMatrix(sessions, keyAnalytics, 12);
  }, [sessions, keyAnalytics]);

  const timelinePoints = useMemo(() => {
    return computeSpeedTimeline(sessions);
  }, [sessions]);

  const calendarData = useMemo(() => {
    return computeActivityCalendar(sessions, 16);
  }, [sessions]);

  // Handler for loading demo data so users can preview the full Keybr visualization immediately
  const handleLoadDemoData = async () => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const demoSessions: GuestSessionMigrationItem[] = [];
    const sampleSpeeds = [42, 45, 48, 47, 52, 50, 56, 58, 62, 59, 64, 68, 67, 72, 70, 75];
    const sampleAccuracies = [93, 94, 95, 96, 96, 97, 98, 97, 98, 99, 98, 99, 100, 99, 98, 99];

    for (let i = 0; i < sampleSpeeds.length; i++) {
      const daysAgo = sampleSpeeds.length - 1 - i;
      const timestamp = new Date(now - daysAgo * 24 * 3600 * 1000 + 1000 * 60 * 15 * i).toISOString();
      const net = sampleSpeeds[i];
      const acc = sampleAccuracies[i];
      demoSessions.push({
        localId: `demo_${i}`,
        sessionType: 'speed_test',
        durationSeconds: 60,
        netWpm: net,
        grossWpm: net + 3,
        accuracyPct: acc,
        totalKeystrokes: net * 5,
        correctKeystrokes: Math.round((net * 5 * acc) / 100),
        errorCount: Math.round((net * 5 * (100 - acc)) / 100),
        mode: i % 4 === 0 ? 'punctuation' : 'words',
        clientTimestamp: timestamp,
        isMigrated: false,
        dedupHash: `demo_hash_${i}`,
      });
    }

    // Populate sample per-key aggregates for A-Z
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const demoKeyAnalytics: Record<string, KeyMetricAggregate> = {};
    alphabet.forEach((letter, idx) => {
      const isWeak = ['q', 'z', 'x', 'p', 'b'].includes(letter);
      const isFast = ['e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h'].includes(letter);
      const attempts = 15 + idx * 8;
      const accuracy = isWeak ? 86.5 : isFast ? 98.4 : 94.2;
      const latency = isWeak ? 380 : isFast ? 145 : 220;

      demoKeyAnalytics[letter] = {
        key: letter,
        totalAttempts: attempts,
        correctCount: Math.round((attempts * accuracy) / 100),
        errorCount: Math.round((attempts * (100 - accuracy)) / 100),
        correctedCount: 2,
        accuracyPct: accuracy,
        averageLatencyMs: latency,
        sampleConfidence: 'high',
        lastPracticed: new Date().toISOString(),
      };
    });

    await seedGuestSessions(demoSessions, demoKeyAnalytics);
    refreshData();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to reset and clear your local practice history?')) {
      await clearGuestSessions();
      refreshData();
    }
  };

  const handlePracticeWeakKeys = (keys?: string[]) => {
    router.push('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Sticky Navigation with Active 'Profile' tab */}
      <Header
        activeTab="profile"
        duration={60}
        onDurationChange={() => {}}
        guestTestCount={sessions.length}
        onRestart={() => router.push('/')}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalTab(mode === 'register' ? 'register' : 'login');
          setIsAuthModalOpen(true);
        }}
      />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.25rem 1.25rem 2.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Profile Header & Identity Card */}
        <ProfileHeader
          currentUser={currentUser}
          guestTestCount={sessions.length}
          averageWpm={stats.allTime.averageNetWpm}
          averageAccuracy={stats.allTime.averageAccuracyPct}
          currentStreakDays={streaks.dailyStreak.current}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onPracticeWeakKeys={() => handlePracticeWeakKeys()}
        />

        {/* Empty State with Demo Data Option */}
        {sessions.length === 0 && isLoaded && (
          <div
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #38bdf8, #6366f1, transparent)' }} />
            <div style={{ fontSize: '2.5rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              No Practice Tests Recorded Yet
            </h2>
            <p style={{ maxWidth: '480px', color: 'var(--text-muted)', fontSize: '0.925rem', margin: 0 }}>
              Complete your first typing test to unlock your Keybr-style All-Time statistics, Gaussian Bell Curve percentile, Accuracy Streaks, and A-Z Key Learning Matrix.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4)',
                }}
              >
                <span>⚡ Take Your First Test</span>
              </button>

              <button
                onClick={handleLoadDemoData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>📊 Load Sample Demo Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. All-Time & Today Statistics Grid */}
        <ProfileStatsGrid stats={stats} />

        {/* 2. Accuracy Streaks Section */}
        <AccuracyStreaksCard streaks={streaks} />

        {/* 3. Relative Typing Speed & Accuracy Bell Curve (Gaussian Histogram) */}
        <RelativeSpeedHistogram
          averageWpm={stats.allTime.averageNetWpm}
          bestWpm={stats.allTime.bestNetWpm}
          averageAccuracy={stats.allTime.averageAccuracyPct}
          bestAccuracy={stats.allTime.bestAccuracyPct}
        />

        {/* 4. Learning Progress Overview (A-Z Key Confidence Matrix) */}
        <KeyMasteryMatrix
          keyRows={keyMasteryRows}
          onPracticeKeys={handlePracticeWeakKeys}
        />

        {/* 5. Typing Speed Over Time (Interactive Progress Line Chart) */}
        <SpeedTimelineChart dataPoints={timelinePoints} />

        {/* 6. Practice Activity Heatmap Calendar */}
        <ActivityCalendar
          days={calendarData.days}
          totalTests={calendarData.totalTests}
          totalMinutes={calendarData.totalMinutes}
          activeDaysCount={calendarData.activeDaysCount}
        />

        {/* Bottom Actions: Clear or Load Sample Data */}
        {sessions.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={handleLoadDemoData}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reload Sample Keybr Data
            </button>
            <button
              onClick={handleClearHistory}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear Practice History
            </button>
          </div>
        )}
      </main>

      {/* Auth Modal for cloud sync */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
        onLogout={() => setCurrentUser(null)}
        guestSessions={sessions}
        onRefreshGuestData={refreshData}
      />

      <Footer />
    </div>
  );
}
