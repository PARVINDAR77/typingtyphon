import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Typing Typhon Terms of Service: Guidelines for accessing our free touch-typing educational platform, speed benchmarking tools, and usage expectations.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 2026';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Bar */}
      <header style={{ width: '100%', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              TYPING <span style={{ color: '#38BDF8' }}>TYPHON</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
              ← Back to Practice
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Article */}
      <main style={{ flex: 1, padding: '3.5rem 1.5rem' }}>
        <article
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Last updated: {lastUpdated} • Effective Date: {lastUpdated}
          </p>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              By accessing or using the Typing Typhon platform, you agree to comply with and be bound by these
              Terms of Service. If you do not agree to these terms, please discontinue using the service.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              2. Free Access & Educational Mission
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon provides free, open-access typing tests, touch-typing curriculum drills, and analytics.
              We are committed to maintaining the core typing drills and speed evaluation tools without mandatory registration
              or paywalls.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              3. Acceptable Use Policy
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              You agree not to use Typing Typhon for any unlawful or abusive purposes, including but not limited to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li>Attempting to disrupt or overwhelm our infrastructure via automated denial-of-service or bot scripting.</li>
              <li>Circumventing authentication controls, session validation, or rate limiters.</li>
              <li>Submitting fraudulent or scripted typing telemetry intended to manipulate competitive benchmark rankings.</li>
              <li>Reverse engineering or extracting internal API endpoints for unauthorized commercial distribution.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              4. Benchmarks & Completion Certificates
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon produces performance reports, WPM calculations, and printable or verifiable digital completion
              certificates based on client-measured input timing and error deductions.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              These benchmarks and certificates represent informal self-assessment and educational achievement. They do
              not constitute formally accredited academic degrees or government-certified vocational qualifications.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              5. Intellectual Property
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              All software, design elements, pedagogical drill structures, logos, and custom graphics on Typing Typhon
              are the proprietary property of the Typing Typhon project maintainers and are protected by applicable
              copyright and intellectual property laws.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              6. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of
              any kind, either express or implied.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              We do not guarantee uninterrupted or error-free operation. In no event shall Typing Typhon or its maintainers
              be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use
              the platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              7. Contact
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              If you have any questions regarding these Terms of Service, please contact us at
              <code style={{ color: 'var(--brand-primary)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>
                terms@typingtyphon.internal
              </code>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
