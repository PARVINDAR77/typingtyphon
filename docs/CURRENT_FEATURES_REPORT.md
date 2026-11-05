# Typing Typhon – Current Features Report

**Document Version:** 1.0.0  
**Scope:** Technical Inventory & Gap Analysis for Futuristic Redesign  
**Project Owner:** Emperor Smart Solutions  

---

## 1. Feature Classification Matrix

| Feature | Category | Current Status | Architecture Layer | Redesign Action |
| :--- | :--- | :--- | :--- | :--- |
| **Real-Time Keystroke Engine** | Core Engine | **Working** | `apps/web/src/engine/TypingEngine.ts` | Preserve math & telemetry; enhance visual cursor and burst effects. |
| **Duration Selector (15s, 30s, 60s, 120s)** | Core Engine | **Working** | `apps/web/src/lib/storage.ts` | Preserve 15s default; restyle into glowing glassmorphic pill group. |
| **Words Mode** | Practice Modes | **Working** | `apps/web/src/engine/words.ts` | Preserve curated word list generation (English 1k/5k sets). |
| **Punctuation & Numbers Modes** | Practice Modes | **Working** | `apps/web/src/engine/words.ts` | Preserve procedural injection; restyle mode selector bar. |
| **Quotes Mode** | Practice Modes | **Missing** | New Engine Feature | Implement famous literature, philosophy, and tech quotes bank. |
| **Custom Text Mode** | Practice Modes | **Missing** | New Engine Feature | Implement paste/custom prompt modal with word tokenizer. |
| **Code Mode** | Practice Modes | **Missing** | New Engine Feature | Implement JavaScript, Python, TypeScript, and HTML/CSS snippets. |
| **Keybr Heatmap & Accuracy Matrix** | Diagnostics | **Working** | `apps/web/src/components/KeybrResults.tsx` | Preserve per-key error calculation; restyle to dark cyber aesthetic. |
| **Radial Accuracy Gauge** | UI Component | **Missing** | New UI Component | Implement animated circular SVG/Canvas gauge with glow ring. |
| **Personal Best Score Badge** | UI Component | **Partially Implemented** | `apps/web/src/lib/storage.ts` | Compute and display high-score trophy badge alongside restart button. |
| **Touch Typing Academy (6 Stages)** | Curriculum | **Working** | `packages/contracts/src/curriculumData.ts` | Restyle into the 5 tiers (Beginner, Basic, Intermediate, Advanced, Pro). |
| **Daily Challenges Hub** | Gamification | **Missing** | New App Section | Implement Daily/Weekly challenge deck, countdown timer, XP rewards. |
| **Global Leaderboard** | Competition | **Missing** | New App Route (`/leaderboard`)| Implement Top-3 3D Podium (Gold, Silver, Bronze) + ranked user table. |
| **Multiplayer Bot Racing** | Competition | **Working** | `apps/web/src/app/multiplayer/page.tsx` | Preserve procedural bot physics; reskin race track to neon cyber highway. |
| **User Profile & Performance Dashboard** | Analytics | **Working** | `apps/web/src/app/profile/page.tsx` | Restyle with level/XP badges, 7-day streak, and interactive line charts. |
| **Interactive 3D Mechanical Keyboard** | Visual / 3D | **Partially Implemented** (2D SVG) | `apps/web/src/components/FingerGuide.tsx` | Build interactive 3D mechanical keyboard with RGB lighting & finger zones. |
| **Brand Story & About Page** | Brand | **Missing** | New App Route (`/about`) | Implement futuristic mission narrative, brand emblem, and core pillars. |
| **Google OAuth 2.0 & Session Auth** | Backend / Auth | **Working** | `apps/api/src/auth/` | Preserve real Google OAuth, JWT tokens, and guest data cloud migration. |
| **Enterprise Admin Dashboard** | Admin | **Working** | `apps/web/src/app/admin/` | Preserve all 10 enterprise management views with dense dark theme. |

---

## 2. Detailed Technical Inventory

### 2.1 Core Typing Engine (`TypingEngine.ts`)
* **Keystroke Processing:** Instantaneous event dispatching. Handles alphanumeric input, space advance, backspace retraction, and optional hard/standard backspace modes.
* **Metric Formulas:**
  $$\text{Gross WPM} = \frac{\text{Total Keystrokes} / 5}{\text{Elapsed Minutes}}$$
  $$\text{Net WPM} = \max\left(0, \frac{(\text{Total Keystrokes} / 5) - \text{Uncorrected Errors}}{\text{Elapsed Minutes}}\right)$$
  $$\text{Accuracy \%} = \frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}} \times 100$$
* **Latency Telemetry:** Records microsecond Inter-Keystroke Interval (`rawIkiArray`), enabling per-key hesitation and confidence scoring.

### 2.2 Learning Curriculum (`curriculumData.ts`)
* **Stage 1: Home Row Foundations** (Lessons 1-1 to 1-4: Space, F & J, D & K, S & L, A & ;)
* **Stage 2: Top Row Reach** (Lessons 2-1 to 2-4: E & I, R & U, T & Y, Q & P, W & O)
* **Stage 3: Bottom Row Foundations** (Lessons 3-1 to 3-4: C & ,, V & M, B & N, X & ., Z & /)
* **Stage 4: Capitalization & Shift Mastery** (Lessons 4-1 to 4-4: Left Shift, Right Shift, Alternating Shifts)
* **Stage 5: Numbers & Symbols** (Lessons 5-1 to 5-5: Number row 1-0, Common programming symbols)
* **Stage 6: Speed, Fluency & Real-World Flow** (Lessons 6-1 to 6-4: Common digraphs, trigraphs, endurance drills)
* **Threshold Verification:** Lessons enforce strict graduation gates (e.g. $\ge 98\%$ Accuracy and $\ge 25$ Net WPM). Lessons are never falsely marked as completed.

### 2.3 Multiplayer Race Engine (`RaceEngine.ts`)
* **Bot Simulation:** Simulates up to 3 autonomous racers with realistic typing velocity variances, organic pause hesitations, and realistic burst curves.
* **Vehicle Sprites:** 4 cyber vehicles rendered in SVG with animated track lanes and real-time lap progress calculations.

### 2.4 Profile Analytics & Heatmaps (`profileAnalytics.ts`, `KeybrResults.tsx`)
* **Mastery Matrix:** Evaluates character confidence across 36 keys (A-Z, 0-9) based on attempt counts, error rates, and median latency.
* **Activity Heatmap:** 365-day practice grid tracking daily tests and cumulative practice minutes.
* **Timeline Chart:** Historical Net WPM progression plotted over time.

---

## 3. Discovered Technical Debt & Bugs

1. **API Origin Routing for Live Custom Domain:** Client-side dynamic resolution previously constructed `${protocol}//${hostname}:4001/api/v1`. On HTTPS domains, connecting directly to unencrypted port 4001 triggered mixed-content blocks and certificate mismatches. (Resolved in `apiConfig.ts` by routing via same-origin `/api/v1`).
2. **Missing Quotes, Custom Text, and Code Mode Handlers:** The UI had buttons for text modes, but lacked content banks for real code snippets (TypeScript, Python, HTML/CSS) and curated quotes.
3. **Absence of Dedicated Challenges & Leaderboard Pages:** While basic streak and race podiums existed in memory, there were no dedicated routes for `/challenges` and `/leaderboard`.
4. **Hero Performance Balance:** The hero section needs to render a futuristic 3D mechanical keyboard without blocking page interactivity or inducing layout shifts on mobile devices.

---

## 4. Proposed New Functionality

1. **Futuristic 3D Mechanical Keyboard (WebGL / Three.js / Canvas):**
   * Realistic individual keycaps with OEM/Cherry profile.
   * Translucent mechanical switch housings with glowing stems.
   * Real-time per-key RGB underglow synced to active target characters.
   * Orbit/tilt camera interaction with gentle idle floating physics.
   * Instant SVG/Canvas fallback for low-power mobile GPUs.
2. **Interactive Typing Hub with Radial Dial (Panel 2):**
   * Smooth circular SVG accuracy meter with dynamic gradient stroke.
   * Modes for Time, Words, Quotes, Custom Text, and Code.
   * Live telemetry HUD with high-contrast JetBrains Mono typeface.
3. **Gamified Daily Challenge Hub (Panel 4):**
   * 24-hour countdown timer (`Time Left 12:45:32`).
   * Challenge criteria: Speed sprint, accuracy lock ($\ge 98\%$), endurance test.
   * XP reward engine (+100 XP, +250 XP for weekly).
   * Streaks and achievement unlocking.
4. **Global Leaderboard (Panel 6):**
   * 3D Gold, Silver, Bronze podiums for top 3 typists.
   * Filterable views: Weekly, Monthly, All-Time.
   * Ranked table displaying country flag, username, WPM, and accuracy.
5. **Interactive 3D Keyboard Explorer (Panel 7):**
   * Color-coded finger zones for touch-typing ergonomics.
   * Interactive key inspection showing finger assignment and common substitution errors.
6. **Brand Story Page (`/about`) (Panel 8):**
   * Narrative platform introduction, engineering principles, and cyber visual emblem.

