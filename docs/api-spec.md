# REST API Specification

## Contract conventions

Base path: `/api/v1`. OpenAPI is the authoritative machine-readable contract once implementation begins. JSON request/response DTOs only; never serialize JPA entities. Use UUIDs, ISO-8601 dates/instants with timezone offsets, pagination (`page`, `size`, bounded maximum, stable sort), and consistent validation. Production traffic uses HTTPS and a same-site secure session cookie. Mutating requests require a CSRF token. OIDC login endpoints are owned by Spring Security, not reimplemented as credential endpoints.

Errors use `application/problem+json` with `type`, `title`, `status`, `detail` (safe user-facing text), `instance`, `code`, optional field validation errors, and `requestId`. Never include SQL, stack traces, tokens, or student data in error details. Use `401` for unauthenticated, `403` for forbidden, `404` when resource existence should not be disclosed, `409` for state/capacity conflicts, `422` for semantic validation, and `429` for rate limiting.

## Authentication and session

| Method and path | Purpose / access |
|---|---|
| `GET /auth/login` | Initiate Spring Security OIDC login using configured provider. |
| `GET /auth/callback` | OIDC callback handled by Spring Security; state/nonce/signature validation required. |
| `POST /auth/logout` | CSRF-protected local logout and OIDC logout redirect where configured. |
| `GET /auth/csrf` | Return a CSRF token suitable for the current session. |
| `GET /me` | Current user's identity, active roles/scopes, faculty profile summary, and UI capabilities. |

No `POST /login` password API. Account linking, provisioning, and role grants are controlled by approved identity lifecycle/admin operations.

## Faculty APIs

| Method and path | Purpose / access |
|---|---|
| `GET /faculty/dashboard` | Own profile, current-month obligation/selected/remaining counts, upcoming assignments, teaching subjects, unread notifications. FACULTY. |
| `GET /faculty/me` | Own profile and assignments/teaching summary. FACULTY. |
| `GET /duties/available?from=&to=&departmentId=&page=&size=` | Eligible open duties, capacity remaining, and selection window. Authenticated faculty; server computes eligibility. |
| `POST /duties/{dutyId}/selections` | Self-select. Body includes applicable `obligationId` only if server-provided; never trusts client counts/type. Returns assignment or `409` for capacity, deadline, quota, duplicate, or conflict. FACULTY. |
| `GET /faculty/me/duty-assignments?from=&to=` | Own active and historical assignments. FACULTY. |
| `GET /faculty/me/subjects` | Active teaching assignments. FACULTY. |
| `GET /faculty/me/performance?classSubjectId=&from=&to=` | Student marks/grades/attendance and aggregates only for a verified teaching assignment. FACULTY. |
| `GET /notifications?page=&size=` | Own notification inbox. Authenticated user. |
| `PATCH /notifications/{id}` | Mark own notification read; ownership enforced. |

## Class advisor and academic APIs

| Method and path | Purpose / access |
|---|---|
| `GET /advisor/classes` | Classes for which the current user has an active advisor appointment. FACULTY. |
| `GET /advisor/classes/{classId}/performance?term=` | Class-wide subject averages, grade distributions, pass rates, attendance summaries. Requires active advisor appointment; privacy thresholds/aggregation policy configured by institution. |
| `GET /advisor/classes/{classId}/students?page=&size=` | Student-level performance in the advised class, within appointment dates. Requires active advisor appointment. |
| `GET /classes/{classId}/subjects/{classSubjectId}/performance` | Subject-level detailed performance. Requires teaching relationship or active class-advisor relationship for that class. |

## HOD APIs

All department-scoped operations derive authorized department scope from active HOD grants; a caller-supplied department ID is checked against that scope on every request.

| Method and path | Purpose / access |
|---|---|
| `GET /hod/dashboard` | Department faculty, duty completion, pending/automatic assignments, classes, advisor summary, subject and academic aggregates. HOD. |
| `GET /hod/faculty?page=&size=` | Faculty in authorized department, profile and duty status. HOD. |
| `GET /hod/classes?page=&size=` | Department classes and advisors. HOD. |
| `GET /hod/performance?classId=&classSubjectId=&term=` | Department-authorized aggregate academic reports; individual records only where specifically permitted. HOD. |
| `GET /hod/reports/duties?period=` | Department-scoped duty report including self-selected, auto-assigned, pending and override indicators. HOD. |
| `GET /hod/audit?from=&to=&page=&size=` | Only department-scoped events explicitly allowed by policy; system-wide audit remains ADMIN-only. |

HOD has no implicit rights to change identity, workload policy, duty capacity, or system-wide settings. Any HOD mutation must be separately approved and explicitly added to the permission matrix.

## Admin APIs

| Method and path | Purpose / access |
|---|---|
| `GET/POST /admin/departments` and `PATCH /admin/departments/{id}` | List/create/update/deactivate departments. ADMIN. |
| `GET/POST /admin/faculty` and `GET/PATCH /admin/faculty/{id}` | Provision profile, update department/designation, activate/deactivate. ADMIN; sensitive changes audited. |
| `GET/POST /admin/designations` and `PATCH /admin/designations/{id}` | Manage designation reference data. ADMIN. |
| `GET/POST /admin/classes`, `GET/POST /admin/subjects`, and related `PATCH` endpoints | Manage academic structure and teaching assignments. ADMIN. |
| `PUT /admin/classes/{classId}/advisor` | Assign/change advisor with effective dates; closes prior appointment transactionally. ADMIN. |
| `GET/POST /admin/exams` and `PATCH /admin/exams/{id}` | Manage exams. ADMIN. |
| `GET/POST /admin/duties` and `PATCH /admin/duties/{id}` | Create/edit duty, capacity, eligibility, venue, window, and state. Cannot reduce capacity below active assignments. ADMIN. |
| `POST /admin/duties/{id}/open` / `POST /admin/duties/{id}/close` / `POST /admin/duties/{id}/cancel` | Explicit lifecycle transitions with validation/audit. ADMIN. |
| `GET/POST /admin/workload-rules` and `PATCH /admin/workload-rules/{id}` | Manage designation duty counts and effective dates. ADMIN. |
| `POST /admin/workload-obligations/{id}/adjust` | Explicitly adjust a period snapshot with reason; does not silently rewrite completed periods. ADMIN. |
| `POST /admin/duties/{dutyId}/assignments` | Manually assign a faculty member. Requires reason; capacity/conflict checks remain mandatory; records `ADMIN_ASSIGNED`. ADMIN. |
| `DELETE /admin/assignments/{id}` | Cancel an assignment with reason; preserve history and audit. ADMIN. |
| `POST /admin/allocations/{period}/run` | Idempotently start/retry an allocation cycle; normally scheduler-driven. ADMIN. |
| `GET /admin/allocations/{period}` | Allocation status, assigned/unfilled obligations, diagnostics. ADMIN. |
| `GET /admin/reports/*` | System-wide reports with bounded filters and asynchronous export for large results. ADMIN. |
| `GET /admin/audit?actor=&entityType=&entityId=&from=&to=&page=&size=` | Search audit records. ADMIN, read-only. |
| `GET /admin/settings` / `PATCH /admin/settings/{key}` | Non-secret operational settings. ADMIN. |

## API invariants and operational requirements

- Server-side authorization is applied to each resource query and command, not merely to route names. Avoid insecure direct object references; inaccessible records return `404` where appropriate.
- Mutations that may be retried accept an `Idempotency-Key` or use an idempotent resource/business key. Duty selection still revalidates state and uses database locking/constraints.
- Large reports use pagination or a job resource (`202 Accepted`, `GET /admin/report-jobs/{id}`); do not hold request threads while building large exports.
- Rate-limit login initiation, mutation bursts, and expensive reports by user/IP with Redis-backed limits. Set request size, pagination, and query-range limits.
- OpenAPI documents security schemes, role/scope requirements, examples, error responses, and state transitions. Avoid exposing internal entity IDs or claims unnecessarily.

## Representative duty selection exchange

`POST /api/v1/duties/{dutyId}/selections` accepts no trusted quota or authorization claims from the client. On success it returns `201 Created` with assignment ID, duty summary, assignment type `SELF_SELECTED`, and updated obligation totals. A race for the last slot returns `409 Conflict` with a stable code such as `DUTY_FULL`; the client refreshes availability.