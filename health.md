# Project Health Report — tbbgps

Date: 2026-03-05

## Executive Summary

Overall health: **Fair (prototype-ready), not production-ready**

The project is functionally strong (live map, diagnostics, reporting tabs, retry/rate-limit handling, local proxy) and works well for internal testing. However, current security and release hygiene still block a safe production deployment.

**Deployment decision (current state): NO-GO for public production.**

---

## What Was Checked

- Core files reviewed:
  - `fleet-dashboard.html`
  - `dev-server.js`
  - `START_PROJECT.md`
  - `project.md`
- Runtime/health checks run:
  - `node --check dev-server.js` ✅
  - Local server startup (`node dev-server.js`) ✅
  - Security grep for hardcoded credentials and CORS policy ✅
    - `loginInput` and `passwordInput` have default credential values
    - Proxy CORS currently allows `*`

---

## Findings

## ✅ Strengths

1. **Functional architecture for runtime behavior**
   - API client implements queueing/rate-limiting and retry/backoff logic.
   - Diagnostics and health-strip UX are present.
   - Marker rendering, clustering, route/stops/fuel/mileage tabs are implemented.

2. **Operationally convenient local setup**
   - `dev-server.js` serves static files and proxies `/gps-api/*` requests.
   - Start instructions are straightforward in `START_PROJECT.md`.

3. **Defensive parsing and compatibility handling**
   - `fleet-dashboard.html` includes many payload-shape fallbacks and timestamp normalizers.

## ⚠️ Risks / Weak Areas

1. **Security: hardcoded credentials in HTML (critical blocker)**
   - `loginInput` and `passwordInput` are prefilled in markup.
   - This is a direct secret exposure risk in any public or shared deployment.

2. **Maintainability: very large single file**
   - `fleet-dashboard.html` is ~2765 lines and mixes HTML/CSS/JS/business logic.
   - Harder to review, test, and safely change.

3. **No automated quality gates detected**
   - No test suite, linting, formatting, or CI checks observed.

4. **Dev proxy CORS policy is permissive**
   - `Access-Control-Allow-Origin: *` in `dev-server.js` is acceptable for local dev only.
   - Must be restricted for production.

5. **Specification drift risk**
   - `project.md` describes some patterns (e.g., security notes/architecture) that are only partially enforced in current implementation.

---

## Deployment Readiness Verdict

### Current status

- **Local/internal demo:** ✅ Ready
- **Public production deployment:** ❌ Not ready

### Blocking items before production

1. Remove all hardcoded credentials from frontend HTML.
2. Introduce environment-driven configuration for API/proxy/security settings.
3. Restrict CORS and deploy proxy behind a proper reverse proxy (Nginx) with HTTPS.
4. Add minimal quality gate (`lint` + smoke check).

---

## Prioritized Improvement Plan

## P0 (Do first)

1. **Remove hardcoded credentials immediately**
   - Clear default `value` attributes for login/password fields.
   - Add `.env`-style local-only mechanism for development if needed.

2. **Add a minimal security baseline**
   - Restrict CORS for production origins only.
   - Keep local dev and production configs separate.
   - Add a short `SECURITY.md` with secrets handling rules.

## P1 (Next)

3. **Modularize frontend code**
   - Split into:
     - `index.html` (structure)
     - `styles.css` (theme/components)
     - `api.js`, `map.js`, `state.js`, `ui.js` (logic modules)
   - Keep behavior identical initially (refactor-only pass).

4. **Introduce code quality tooling**
   - Add ESLint + Prettier.
   - Add basic scripts: `lint`, `format`, `check`.

5. **Add smoke tests**
   - Start with API client unit tests for parsing/time handling.
   - Add one e2e smoke (login modal + map initialization).

## P2 (Then)

6. **Improve docs alignment**
   - Update `project.md` or implementation so they match expected architecture and security rules.

7. **Performance/observability polish**
   - Add lightweight performance budget checks (initial render, marker update time).
   - Keep diagnostics export, and add version/build metadata in report.

---

## Suggested Next 3 Actions (Practical)

1. Remove embedded credentials from `fleet-dashboard.html` (same day).
2. Add ESLint/Prettier and a simple `npm run check` (same day).
3. Split API client and map logic into separate JS files (1–2 days, no behavior changes).

---

## Hosting Recommendation

- If choosing between shared hosting and VPS, use **VPS** for this architecture.
- Reason: app relies on a Node proxy (`/gps-api`) that is typically not supported on basic shared static hosting.
- Hostmasters is fine if using their **VPS** tier.

---

## Current Health Score (informal)

- Functionality: **8/10**
- Stability: **7/10**
- Security hygiene: **3.5/10**
- Maintainability: **5/10**
- Testability/automation: **3/10**

**Overall: 5.2/10**

Strong operational prototype; needs focused security and release-hardening before production deployment.

---

## What’s More? (Additional High-Impact Improvements)

If you want to push this from “working” to “production-grade,” these are the next valuable upgrades:

1. **Observability upgrade**
   - Add structured client logs (`level`, `event`, `vehicleId`, `endpoint`, `latency`).
   - Add error IDs in UI so support can correlate user reports with logs.

2. **Resilience patterns**
   - Add circuit-breaker behavior after repeated API failures.
   - Cache latest successful panel datasets (stops/fuel/mileage) for offline read mode.

3. **Data quality controls**
   - Add anomaly flags for invalid jumps (e.g., impossible speed/location leaps).
   - Surface stale telemetry confidence score per vehicle.

4. **Access control readiness**
   - Role-oriented UI modes (dispatcher, supervisor, viewer).
   - Hide diagnostics/export/admin controls by role.

5. **UX scalability for large fleets**
   - Virtualized vehicle list rendering for 1000+ units.
   - Bulk actions (select group, focus convoy, export selected only).

6. **Release discipline**
   - Add changelog + semantic versioning.
   - Add pre-release checklist (security, smoke test, perf budget, rollback path).

7. **Deployment hardening**
   - Add Dockerfile for consistent runtime.
   - Environment-driven config (`API_BASE_URL`, polling, timeouts, CORS origin allowlist).

8. **Compliance and auditability**
   - Add audit trail for critical user actions (login/logout, export, assignment updates).
   - Add data retention policy note for location/fuel/driver history.

---

## UI/UX Improvements You Can Add Next

These are practical UI/UX upgrades specifically useful for a fleet-control dashboard:

### 1) Information hierarchy

- Make one **primary action** per area (e.g., “Fit all vehicles”), visually strongest.
- Keep secondary actions (settings/diagnostics) less dominant.
- Use consistent spacing scale (`4/8/12/16/24`) to reduce visual noise.

### 2) Vehicle list usability

- Add **compact / comfortable density toggle**.
- Add quick filters as chips: `All`, `Moving`, `Idle`, `Stopped`, `Offline`.
- Show mini metadata row: driver, fuel %, last update age.
- Keep selected vehicle pinned at top of list (“Now tracking”).

### 3) Map interaction quality

- Add **"center selected"** and **"follow selected"** as sticky controls.
- Add light marker animation only for moving vehicles (avoid over-animation).
- Improve cluster interactions: preview top 3 vehicle names on hover.
- Add scale bar and optional traffic/satellite layer toggle.

### 4) Better tab experience (Stops/Fuel/Mileage/Routes)

- Persist active tab in local storage (restore after refresh/login).
- Show live count badges (`Stops 12`, `Fuel events 3`, etc.).
- Add loading skeletons instead of plain text while waiting.
- Show empty states with action hints (“Select another date range”).

### 5) Alerts and feedback

- Standardize toast types: success/info/warn/error with icon + timeout.
- Add non-blocking warning panel for API degradation/retries.
- Use plain-language error text + “Try again” action.

### 6) Accessibility improvements

- Increase keyboard navigation (tab order, Enter/Space on controls).
- Add visible focus styles on all interactive elements.
- Ensure minimum contrast ratio (especially muted text on dark bg).
- Add ARIA labels for map controls and status indicators.

### 7) Performance-feel UX

- Debounce search input (150–250ms).
- Virtualize long vehicle lists (for 500+ units).
- Use optimistic UI where safe (tab switch immediate, data updates async).

### 8) Mobile/tablet operator flow

- Add collapsible sidebar drawer for tablets.
- Add bottom sheet for selected vehicle details on mobile.
- Increase touch target sizes to 44px+ for map actions.

### 9) Visual consistency

- Introduce reusable UI tokens/components:
  - `status chip`
  - `card`
  - `toolbar button`
  - `empty state`
  - `toast`
- Keep icon style and label wording consistent across tabs.

### 10) Operator-focused additions

- Add **quick command palette** (`Ctrl/Cmd + K`) for frequent actions.
- Add **saved views** (e.g., “Night shift fleet”, “City center trucks”).
- Add shift handover panel: “what changed in last 8 hours”.
