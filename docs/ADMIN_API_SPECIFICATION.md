# Typing Typhon — Admin API Specification

**Document Version:** 1.0.0  
**Protocol:** REST over HTTPS  
**Base URL:** `/api/v1/admin`  
**Authentication:** HttpOnly Cookie (`access_token`) or `Authorization: Bearer <token>`  
**Authorization Guard:** `AdminGuard` (`role === 'ADMIN'`)  

---

## 1. Authentication & Session Endpoints

### 1.1 Administrator Login
- **Route:** `POST /api/v1/auth/admin/login`
- **Access:** Public (Rate limited to 5 attempts per IP per minute)
- **Request Body:**
  ```json
  {
    "email": "admin@typingtyphon.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-1234",
      "email": "admin@typingtyphon.com",
      "username": "admin",
      "fullName": "System Admin",
      "role": "admin",
      "isEmailVerified": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    "message": "Admin session authenticated successfully."
  }
  ```
- **Cookies Set:** `access_token` (15 min, HttpOnly, SameSite=Lax), `refresh_token` (30 days).

---

## 2. Dashboard & Telemetry Endpoints

### 2.1 Overview Dashboard KPIs
- **Route:** `GET /api/v1/admin/dashboard`
- **Query Parameters:** `period` (`7d`, `30d`, `90d`, `all`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "totalUsers": { "value": 12458, "changePct": 12.4, "trend": "up" },
        "activeUsers": { "value": 842, "changePct": 18.2, "trend": "up" },
        "testsCompleted": { "value": 1238450, "changePct": 24.1, "trend": "up" },
        "avgWpm": { "value": 52.3, "changePct": 5.8, "trend": "up" }
      },
      "userGrowth": [
        { "date": "Oct 1", "totalUsers": 10200, "newUsers": 120 },
        { "date": "Oct 5", "totalUsers": 10800, "newUsers": 145 },
        { "date": "Oct 10", "totalUsers": 11300, "newUsers": 130 },
        { "date": "Oct 15", "totalUsers": 11750, "newUsers": 180 },
        { "date": "Oct 20", "totalUsers": 12100, "newUsers": 195 },
        { "date": "Oct 25", "totalUsers": 12350, "newUsers": 150 },
        { "date": "Oct 31", "totalUsers": 12458, "newUsers": 160 }
      ],
      "userDistribution": {
        "guests": { "count": 7715, "pct": 62 },
        "registered": { "count": 3861, "pct": 31 },
        "premium": { "count": 882, "pct": 7 }
      },
      "recentActivity": [
        {
          "id": "act-1",
          "user": "Alex Johnson",
          "avatar": "A",
          "action": "Completed Speed Test - 78 WPM",
          "timeAgo": "2 minutes ago",
          "timestamp": "2026-10-28T09:55:00.000Z"
        },
        {
          "id": "act-2",
          "user": "Sarah Chen",
          "avatar": "S",
          "action": "Completed Lesson 2.1 - Passed",
          "timeAgo": "5 minutes ago",
          "timestamp": "2026-10-28T09:52:00.000Z"
        },
        {
          "id": "act-3",
          "user": "Mike Davis",
          "avatar": "M",
          "action": "Joined the platform",
          "timeAgo": "12 minutes ago",
          "timestamp": "2026-10-28T09:45:00.000Z"
        }
      ],
      "topLessons": [
        { "id": "lesson-1", "name": "Home Row Basics", "completions": 3245, "passRate": 92 },
        { "id": "lesson-2", "name": "Keys F & J", "completions": 2891, "passRate": 88 },
        { "id": "lesson-3", "name": "Keys D & K", "completions": 2654, "passRate": 85 }
      ],
      "platformHealth": {
        "status": "All Systems Operational",
        "apiServer": 100,
        "database": 100,
        "fileStorage": 100,
        "multiplayerService": 99.9,
        "lastUpdated": "2026-10-28T10:00:00.000Z"
      }
    }
  }
  ```

---

## 3. User Management Endpoints

### 3.1 Paginated User Directory
- **Route:** `GET /api/v1/admin/users`
- **Query Parameters:** `page`, `limit`, `search`, `role`, `status`, `sortBy`, `sortOrder`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "user-1",
          "name": "Alex Johnson",
          "email": "alex@example.com",
          "avatar": "A",
          "type": "Registered",
          "testsCount": 124,
          "avgWpm": 68.5,
          "joinedDate": "Oct 28, 2024",
          "status": "Active"
        }
      ],
      "meta": {
        "total": 12458,
        "page": 1,
        "limit": 10,
        "totalPages": 1246
      },
      "summary": {
        "totalUsers": 12458,
        "guests": 7715,
        "registered": 3861,
        "premium": 882
      }
    }
  }
  ```

### 3.2 Update User Status
- **Route:** `PATCH /api/v1/admin/users/:id/status`
- **Request Body:**
  ```json
  {
    "status": "Suspended",
    "reason": "Suspected automated script usage"
  }
  ```
- **Response (200 OK):** Updates user record and commits immutable entry to `AuditLog`.

---

## 4. Curriculum, Reports & Health Endpoints

- `GET /api/v1/admin/curriculum/stages`: Retrieves all 6 curriculum stages, lesson counts, and user completion rates.
- `PATCH /api/v1/admin/curriculum/lessons/:id`: Updates pass criteria thresholds and target keys.
- `GET /api/v1/admin/reports`: Generates structured report payload with option for CSV download.
- `GET /api/v1/admin/system/health`: Live latency, database connection status, memory utilization, and uptime.
- `GET /api/v1/admin/audit-logs`: Audit ledger records with actor, action, target, timestamp, and diff payload.
