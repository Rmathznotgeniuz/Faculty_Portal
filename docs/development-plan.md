# Development Roadmap

This is a gated, incremental roadmap. No application code is part of the current architecture-planning task. Each milestone should produce reviewable artifacts and tests before the next feature expands the system.

## Milestones

| # | Milestone | Deliverables and exit criteria |
|---|---|---|
| 0 | Architecture approval | Review architecture, ER model, API, authorization, allocation and deployment policies with university stakeholders. Resolve open policy decisions listed below. No application implementation until approved. |
| 1 | Repository and delivery foundation | Agree module/package boundaries, branch/review rules, GitHub Actions baseline, formatting/static analysis, environment configuration conventions, secret scanning, Docker Compose strategy, and ADR process. CI runs on a minimal project skeleton only after approval. |
| 2 | Persistence foundation | Spring Boot 3.x compatible with Java 21, PostgreSQL, Flyway, configuration validation, health checks, structured logs, centralized errors, Testcontainers, and initial normalized migrations. Verify clean install and migration from empty DB. |
| 3 | OIDC identity and authorization | Keycloak-compatible integration, Redis-backed server-side session, CSRF, `/me`, user provisioning/link policy, roles and department scopes, authorization policy tests. Verify no password endpoint and negative cross-scope tests. |
| 4 | Organization and academic structure | Department, designation, faculty, academic year, class, student, subject, class offering, teaching assignment, and advisor models/APIs with DTO validation and admin workflow. Verify effective dates and foreign-key integrity. |
| 5 | Exam duty setup and policy | Exam/duty CRUD, lifecycle, eligibility, designation workload policy, monthly obligation snapshot, audit and admin configuration UI/API. Verify policy changes do not silently alter prior obligations. |
| 6 | Safe faculty self-selection | Faculty dashboard essentials, available-duty query, self-selection transaction, conflict/quota/capacity/duplicate protection, notifications, and PostgreSQL concurrency integration tests. Stress concurrent selection of the final slot and prove capacity invariant. |
| 7 | Automatic assignment | Idempotent worker/job runs, candidate ranking, unfilled reasons, workload balancing, audit, notifications, retry/operations view. Test capacity contention, deterministic ranking, leave/availability cases, and safe reruns. |
| 8 | Academic performance and advisor views | Marks/grades/attendance ingestion and read APIs, aggregates/trends, teaching-resource scope, class-advisor cross-subject view. Verify unrelated-student and cross-class access denial. |
| 9 | HOD/admin reporting and operations | Department dashboard and reports, admin reports, audit search, bounded/paginated APIs, asynchronous exports only if required, reporting access tests. |
| 10 | Security and production hardening | Threat model, OWASP ASVS checklist, dependency/container scans, headers/CORS/CSRF/rate limits, secret management, backups/restore, monitoring/alerts, incident/retention procedures, accessibility and privacy review. Close high-risk findings. |
| 11 | Performance, acceptance, launch | k6/JMeter peak and contention tests, query/index tuning, pool sizing, staging UAT, migration/rollback rehearsal, SLO/RPO/RTO agreement, runbooks, production readiness sign-off. |

## Definition of done for each milestone

- Acceptance criteria and API/schema changes are reviewed; migrations are forward-compatible and reproducible.
- DTO validation, safe centralized errors, structured observability, and relevant authorization checks are included.
- Unit tests cover business rules; integration tests cover persistence, security/resource scope, and transaction behavior where relevant.
- OpenAPI is updated; operator/user-facing configuration and runbooks are updated when behavior changes.
- CI passes, dependency risks are reviewed, no secrets are committed, and the next milestone is not started with unresolved critical findings.

## Initial acceptance scenarios

1. OIDC sign-in and provider-owned MFA work; inactive/revoked users cannot continue using stale authorization.
2. A faculty member sees own profile, only eligible duties, own teaching records, and advisor-class records only during an active appointment.
3. HOD cannot read another department's faculty, classes, academic records, exports, or reports by changing an ID/filter.
4. Admin can configure workload requirements in the database-backed admin interface; changing a future rule does not rewrite a snapshotted current obligation without an explicit adjustment.
5. Concurrent selection of a final duty slot never exceeds capacity; one faculty member cannot exceed the applicable quota through concurrent requests; duplicates and schedule conflicts are rejected.
6. Automatic allocation is auditable, idempotent, respects eligibility/availability/conflicts/capacity, balances workload deterministically, and reports unfilled obligations.
7. Student marks/grades/attendance aggregates are correct and scoped; academic data does not appear in general logs or notifications.
8. A tested restore can recover the agreed data within institution-approved RPO/RTO; dashboards/alerts expose service, database, IdP, and allocation health.

## Decisions required before implementation

- University timezone, academic calendar, duty month boundaries, selection grace period, and how cross-month duties count.
- Initial workload policy values and when obligations are snapshotted; treatment of designation/department changes during a period.
- Rules for leave/absence source, approved exemptions, required rest between duties, and definition of consecutive duties.
- Whether an ADMIN quota override can add extra duty assignments, and whether any emergency exception may bypass schedule conflict (recommended default: no).
- HOD permissions beyond department-scoped read/report access; any HOD advisor-assignment or faculty-management delegation.
- Student-data access/retention policy, aggregate privacy thresholds, grade scale, pass threshold, and report/export permissions.
- OIDC claims, employee ID source, provisioning/deprovisioning and account linking; MFA/step-up policy; session lifetime; hosting and secret manager.
- Expected peak simultaneous sessions and duty-selection traffic, SLO, RPO/RTO, backup retention, hosting topology, and operational ownership.
- Data source/import process for students, enrollments, marks, attendance, and faculty teaching assignments.

## Scope guardrails

Keep one modular monolith and one relational system of record. Add Redis only for the stated session/cache/rate-limit/coordination needs. Defer email, service extraction, advanced global optimization, external analytics, and student-facing accounts until a validated requirement justifies them. Do not generate the whole application in one step; obtain approval and complete one milestone at a time.