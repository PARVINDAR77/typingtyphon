# Typing Typhon — Administrative Metrics Dictionary

**Document Version:** 1.0.0  
**Scope:** Definition, derivation, data source, and refresh boundaries for all administrative metrics.  
**Date:** October 2026  

---

## 1. User & Account Metrics

| Metric Name | Derivation Formula / Definition | Data Source | Integrity & Refresh Rules |
| :--- | :--- | :--- | :--- |
| **Total Users** | $\sum \text{Users (Registered)} + \sum \text{Unique Guest Fingerprints}$ | `User` table + server-tracked guest migrations | Daily deduplication by unique identifier. |
| **Active Users (DAU)** | Distinct users who completed $\ge 1$ typing test in the last 24 hours | `TypingSession` table grouped by `userId` | Computed on request with 5-minute cache. |
| **Monthly Active Users (MAU)** | Distinct users with activity within the rolling 30-day window | `TypingSession.completedAt >= NOW() - 30d` | Aggregated nightly / on-demand. |
| **User Distribution** | Ratio of Guests vs. Registered vs. Verified typists | `User` table and session attribution flags | Percentages sum to exactly 100%. |

---

## 2. Typing Performance & Telemetry Metrics

| Metric Name | Derivation Formula / Definition | Boundary Bounds |
| :--- | :--- | :--- |
| **Net WPM** | $\frac{\text{Correct Keystrokes} / 5}{\text{Time (min)}} - \frac{\text{Uncorrected Errors}}{\text{Time (min)}}$ | Clamped: $[0, 350]$. Speeds $> 220$ flagged for telemetry review. |
| **Gross WPM** | $\frac{\text{Total Keystrokes} / 5}{\text{Time (min)}}$ | Standard 5 characters per word convention. |
| **Accuracy %** | $\frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}} \times 100$ | Clamped: $[0\%, 100\%]$. |
| **Tests Completed** | Total count of validated test submissions where status $\ne \text{'INVALID'}$ | Filtered against bot / corrupted packets. |
| **Avg. Test Duration** | $\frac{\sum \text{durationSeconds}}{\text{Total Tests}}$ | Standard test modes: 15s, 30s, 60s, 120s. |

---

## 3. Curriculum & Learning Metrics

| Metric Name | Derivation Formula / Definition | Thresholds |
| :--- | :--- | :--- |
| **Lesson Completions** | Count of lesson attempts where $\text{Acc} \ge \text{minAcc}$ and $\text{WPM} \ge \text{minWpm}$ | Stage 1 default: $\ge 95\%$ Acc, $\ge 20$ WPM. |
| **Pass Rate %** | $\frac{\text{Passed Attempts}}{\text{Total Attempts}} \times 100$ | Computed per lesson and per stage. |
| **Stage Drop-Off** | Drop in student volume between stage $N$ and stage $N+1$ | Identifies curriculum difficulty bottlenecks. |
