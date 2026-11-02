# Typing Typhon — Administrative Security & Threat Review

**Document Version:** 1.0.0  
**Scope:** Threat Modeling, RBAC Enforcement, Audit Immutability, and Data Protection.  
**Date:** October 2026  

---

## 1. Threat Modeling & Mitigation Matrix

| Threat Vector | Severity | Vulnerability Description | Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **Privilege Escalation** | Critical | Regular user accesses admin route or endpoint | Server-side `AdminGuard` validates JWT `role === 'ADMIN'`. Role cannot be set or updated via public registration. |
| **Credential Stuffing** | High | Automated brute-force attacks against `/admin/login` | NestJS `ThrottlerGuard` limits admin login attempts to 5 per minute per IP. Constant-time bcrypt verification. |
| **Session Hijacking / XSS** | High | Injected script steals tokens from storage | JWT access and refresh tokens stored exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Zero tokens stored in `localStorage`. |
| **CSV Formula Injection** | Medium | User names containing `=CMD(...)` or `+SUM(...)` trigger spreadsheet exploits | All CSV export strings sanitized: prepending single quote `'` to cells starting with `=`, `+`, `-`, `@`. |
| **Tampering with Audit Logs** | Critical | Administrator purges or alters action logs | `AuditLog` table lacks update/delete APIs. Append-only architectural guarantee. |
| **N+1 Database Exhaustion** | High | Fetching full user relations in dashboard queries | Database aggregations (`count`, `avg`, `groupBy`) with strict pagination (`LIMIT`, `OFFSET`). |

---

## 2. Administrator Provisioning Protocol

1. No public registration endpoint may assign `Role.ADMIN`.
2. Admin users are provisioned via secure server CLI / direct DB seed or authorized existing SuperAdmin promotion.
3. Every high-privilege action writes to `AuditLog` recording:
   - `actorUserId`
   - `actionType` (e.g. `USER_SUSPENDED`, `LESSON_UPDATED`)
   - `targetEntity` & `targetId`
   - `diffJson`
   - `ipAddress`
   - `timestamp`
