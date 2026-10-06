# Security Architecture

This document defines security boundaries and required architectural behavior for the University Faculty Portal. It is a security specification, not an application implementation guide. Student identifiers, marks, grades, attendance, and academic records are sensitive institutional data.

## Identity Provider Trust Boundary

The university identity provider is responsible for authentication, MFA, identity proofing, and provider-owned credential lifecycle. The portal does not own university passwords and does not implement custom password authentication or custom MFA.

The application is responsible for validating OIDC responses and tokens according to the configured flow; linking an external identity using `(issuer, subject)`; managing the local user/account lifecycle; assigning application roles and permissions; and enforcing resource authorization. OIDC/OAuth 2.0 Authorization Code flow is used through Spring Security with a Keycloak-compatible provider; Microsoft Entra ID/Active Directory or another institutional provider is supported through provider configuration and claim mapping. Validate issuer, audience/client, signature, state, nonce, redirect URI, and token time claims as applicable to the configured flow. Use PKCE where supported/appropriate.

An email address or arbitrary client-supplied claim must never by itself grant `ADMIN` or `HOD` privileges. Privileged role grants and changes follow an approved local authorization and audit process. Define provisioning/linking, employee-ID matching, duplicate identity handling, deprovisioning, role grant approval, and emergency access before production.

## Authentication, Sessions, and Step-Up

Use server-side Spring Session stored in Redis so multiple API instances can share sessions. The browser receives only an opaque session cookie with `Secure`, `HttpOnly`, an appropriate restrictive `SameSite` setting, and a narrow cookie path/domain. Rotate the session ID after authentication and after privilege changes where applicable. Enforce both idle timeout and an absolute maximum session lifetime. Exact timeout values are deployment/security-policy decisions and must not be silently invented in this specification.

Logout invalidates the server-side session and expires the browser cookie; perform identity-provider logout/redirect where configured. Logout is CSRF-protected. Do not store authentication/access/refresh tokens in `localStorage` or `sessionStorage`, expose tokens to ordinary application JavaScript, or place tokens in URLs. If Redis is unavailable, do not fall back to process-local sessions; fail safely according to the session availability policy.

Privileged actions may require recent authentication or IdP step-up MFA based on university security policy. Examples include granting/removing `ADMIN` or `HOD` privileges, changing workload policy, changing duty capacity/eligibility, administrative duty overrides, exporting sensitive academic reports, and changing security-sensitive settings. The identity provider remains responsible for MFA. The application verifies the authentication/assurance information available from the configured IdP; it must not invent or simulate an assurance level. The exact step-up policy must be approved by the university security/identity owner before production.

## Authorization and Fail-Closed Behavior

Apply role-level authorization and resource-level authorization in backend services and authorization-scoped data queries. Default deny. Missing, stale, or ambiguous authorization data results in denial. Failed backend authorization must never fall back to frontend route checks or hidden controls.

Client-supplied `facultyId`, `departmentId`, `classId`, `studentId`, `subjectId`, role, or permission cannot expand access. The backend derives the principal from the authenticated identity and evaluates resource-level access against current authoritative PostgreSQL relationships. HOD access remains restricted to active authorized department scope. Faculty access remains restricted to their authorized teaching, duty, and advisor resources. `CLASS_ADVISOR` is an appointment-derived responsibility for a class and effective period, not a global role. Do not duplicate the detailed permission matrix here; it is maintained in `docs/authorization.md`.

Prevent IDOR/BOLA by using authorization-scoped lookups and by checking scope on list, detail, aggregate, and export paths. A valid identifier is not proof of permission. Return non-disclosing not-found responses where resource existence should not be revealed. Authorization relationships are rechecked at command time for sensitive or mutable operations.

## Student Data Protection

Student identifiers, marks, grades, attendance, and academic records are sensitive institutional data. Minimize collection, access, display, processing, and output:

- API responses contain only fields required for the requested function. List and detail endpoints avoid unnecessary sensitive fields.
- Logs never contain full academic records. Notifications do not contain unnecessary marks or student information.
- Analytics and metric labels do not contain student identifiers or sensitive academic values.
- Exports are explicitly authorized, scoped like the corresponding interactive API, and audited. Report generation applies the same authorization rules as interactive APIs; asynchronous processing does not grant broader access.
- Student records remain uncached by default. Caching requires a documented performance requirement and a safe authorization-aware keying, freshness, and invalidation design.
- Minimize data in URLs, error messages, browser storage, and operational telemetry.

Institutional/legal owners define applicable retention, access, privacy, and incident obligations. This document does not invent retention periods or legal requirements.

## Input and Business Validation

Both input validation and business validation are enforced server-side. Frontend checks are only usability aids and are never authoritative.

**Input validation** covers data types, required fields, length, format, ranges, allowed enum values, request body size, pagination limits, date-range limits, and allowed sort/filter fields. Use parameterized JPA/database queries; never concatenate untrusted input into SQL.

**Business validation** covers authorization; eligibility; workload; capacity; duplicate assignment; schedule conflict; appointment validity; duty state and selection window; and the academic relationship that permits access to a student/class/subject. Revalidate mutable state inside the relevant transaction.

## Web Security, Headers, and CORS

Use HTTPS/TLS for browser, API, and identity-provider communication. Production should prefer same-site/same-origin frontend and API deployment and avoid CORS where unnecessary. For development, explicitly allow only configured development origins. If CORS is required, use an explicit allow-list, never wildcard origins with credentials, never reflect arbitrary `Origin` headers, and keep allowed methods and headers minimal.

Because browser authentication uses cookies, protect every state-changing browser request with CSRF protection, including `POST`, `PUT`, `PATCH`, `DELETE`, and logout. `GET` and `HEAD` must not perform state-changing operations. CSRF tokens are tied to the authenticated session according to the chosen Spring Security strategy. Do not disable CSRF merely because OIDC is used.

Apply secure HTTP headers as appropriate to the final deployment:

- HSTS after HTTPS deployment is stable.
- `X-Content-Type-Options`.
- A restrictive `Content-Security-Policy`, including `frame-ancestors` protection against clickjacking.
- `Referrer-Policy`.
- An appropriate `Permissions-Policy` where required.
- Secure cookie attributes (`Secure`, `HttpOnly`, and restrictive `SameSite`).

Exact CSP directives depend on the final frontend/deployment architecture and must be restrictive. Do not introduce unsafe wildcard CSP rules for convenience. React output escaping is the default; avoid unsafe HTML rendering and validate/encode untrusted content appropriately.

## Database Security

PostgreSQL is the authoritative system of record. The production database is private and not publicly accessible; application and worker access uses controlled network paths. Use environment-specific credentials, rotate them, and apply least privilege. The runtime database account must not have schema DDL privileges. Use a separate, controlled migration identity for Flyway. Restrict production interactive database access and audit approved access. Encrypt backups where supported and test restores. Do not introduce another database.

Sensitive writes use PostgreSQL transactions, constraints, and reviewed concurrency controls. Duty assignment correctness must not depend on Redis. Preserve auditable history and avoid destructive deletion of academic/assignment records outside approved retention processes.

## Redis Security and Boundaries

Redis is non-authoritative. It may contain server-side sessions, disposable cache entries, rate-limit state, and optional ephemeral worker coordination. It must never be the authoritative source for students, marks, attendance, faculty, workload obligations, exam duties, duty assignments, or durable job state. Those records and durable job status remain in PostgreSQL. Redis failure must not cause an insecure local-session fallback or corruption/loss of authoritative data.

Sensitive cache entries require explicit authorization-aware keying, bounded lifetime, and invalidation after relevant data or permission changes. Student records remain uncached by default unless the documented exception above is satisfied. Redis locks never replace PostgreSQL transaction and constraint guarantees.

## Duty Concurrency Security

All assignment writers (self-selection, automatic allocation, and admin assignment) use the same authoritative backend transactional assignment service. The service executes this model in PostgreSQL:

```text
BEGIN TRANSACTION
  lock faculty obligation
  lock duty
  recheck authorization, eligibility, selection window and duty state
  recheck schedule conflict
  recount active assignments and verify quota and capacity
  insert assignment, relying on database uniqueness constraints as defense in depth
COMMIT
```

The frontend availability count is advisory and must never be trusted. Redis locks must never replace PostgreSQL correctness. See `docs/architecture.md` and `docs/database.md` for detailed locking order, constraints, and allocation invariants.

## Rate Limiting and Abuse Controls

Apply configurable rate limits to OIDC login initiation, authentication/session-sensitive endpoints, expensive reports, administrative mutations, high-frequency duty-selection attempts, and other identified abuse-sensitive endpoints. Use Redis-backed rate limiting where appropriate. Exceeding a limit returns `429 Too Many Requests` with a safe response. Rate limiting is an abuse control, not the source of business correctness; exact thresholds are deployment/security-policy decisions and are not hardcoded in this document.

Enforce request body limits, pagination limits, bounded query/date ranges, and reasonable request timeouts. Monitor repeated authentication failures, forbidden access, unusual selection attempts, and expensive report usage without logging sensitive data.

## Audit Security

Record important administrative, security, and business events, including role/permission changes; department-scope changes; faculty lifecycle changes; workload policy changes and obligation adjustments; advisor changes; exam/duty lifecycle changes; self-selected, auto-assigned, and admin-assigned duty events where required; assignment cancellation/override; report exports; security administration; and authentication/security events where appropriate.

Audit fields include, where applicable, actor, action, entity type, entity ID, timestamp, outcome, request ID, source IP, and before/after values where safe. Audit records are append-oriented; normal users cannot modify audit history. Restrict audit access and protect audit payloads from accidental secret or sensitive academic-data leakage. Institutional policy defines retention. Consider tamper monitoring and integrity controls before production; no specific immutable-storage technology is mandated here.

## Logging and Metrics Security

Logs are structured and include request/correlation ID, operation/module, outcome, and duration where useful. Production log access is restricted. Logs must exclude passwords, access/refresh tokens, cookies/session IDs, secrets, unnecessary student/faculty personal data, and full academic records. Avoid sensitive data in URLs and avoid sensitive values or identifiers in metric labels. Sanitize untrusted values to prevent log injection. Metrics are aggregated and must not expose student identifiers or academic records.

## Security Error Handling

Authentication failures return safe generic responses. Authorization failures do not reveal unnecessary resource existence. Validation errors disclose only safe field-level information. Unexpected errors are recorded internally with request IDs and sanitized context. Client responses never contain stack traces, SQL, secrets, tokens, session identifiers, or internal infrastructure details. Keep the API error format in `docs/api-spec.md` (`application/problem+json`).

## File Uploads

File uploads are not part of the current architecture and are not implemented here. If uploads are introduced later, they require a separate security design covering file type allow-list, content validation, size limits, malware scanning where required, storage isolation, authorization, filename/path safety, download authorization, and retention.

## Secure Delivery Lifecycle

Store environment configuration and secrets outside source code; commit only examples without secrets. Production changes require protected branches and required review. Apply least privilege to CI credentials and deployment identities.

Security gates include, where appropriate, dependency scanning, secret scanning, static analysis, container scanning, migration validation, unit/integration/security tests, authorization regression tests, and artifact integrity/provenance appropriate to the deployment environment. These gates complement, not replace, review and institutional security approval. Do not prescribe additional third-party products without a demonstrated need.

## Threat Model

| Threat category | Primary architectural mitigation |
|---|---|
| Compromised or incorrect OIDC claims | Validate OIDC issuer/audience/signature/state/nonce and flow; map by issuer + subject; never grant privileged roles from email or arbitrary client claims; control local role grants. |
| Stolen or expired sessions | Opaque secure HttpOnly cookie; Redis-backed server session; ID rotation; idle and absolute expiry; safe logout/invalidation; no browser token storage. |
| CSRF | Session-bound CSRF protection on every state-changing cookie-authenticated request, including logout; safe methods do not mutate state. |
| XSS | React escaping, avoid unsafe HTML, restrictive CSP and secure headers, validate untrusted input. |
| IDOR/BOLA | Default-deny backend resource authorization against current PostgreSQL relationships; scoped repository queries and non-disclosing errors. |
| Privilege escalation | Separate local application roles from IdP authentication; approved role grants; fail-closed checks; audit; step-up according to approved policy. |
| Cross-department data leakage | HOD scope derived from active grants and checked on every query/report/export; deny missing or ambiguous scope. |
| Student-data leakage | Least data in responses, logs, notifications, metrics and caches; role/resource checks; scoped reports/exports; restricted access. |
| Report/export abuse | Authorize creation and download with the same resource rules as interactive APIs; audit exports; bound report inputs and access. |
| Brute force/rate-limit abuse | IdP-owned authentication controls plus configurable Redis-backed limits on login/session-sensitive and abuse-sensitive endpoints; monitor safely. |
| Duty capacity race conditions | PostgreSQL transaction and row locks, rechecks, constraints, and shared assignment service; UI counts and Redis locks are not authoritative. |
| Duplicate assignments | PostgreSQL uniqueness constraints, idempotent operations, and transactional rechecks across all assignment writers. |
| Malicious client-side manipulation | Treat all frontend state/claims/validation as untrusted; derive principal and scope on the server; validate every request. |
| Redis failure or misuse | Redis is non-authoritative; no local-session fallback; durable domain/job state and assignment correctness remain in PostgreSQL. |
| PostgreSQL compromise | Private network, least-privilege runtime/migration accounts, restricted/audited interactive access, protected credentials and encrypted backups where supported. |
| Worker replay/retry | Durable PostgreSQL job state, idempotency/business keys, bounded retry, and shared transactional assignment service. |
| Supply-chain/dependency vulnerabilities | Dependency/static/container scanning as appropriate, reviewed updates, protected branches, required review, and artifact integrity controls. |
| Secret exposure | Secret manager/environment injection, no secrets in source/images/logs, secret scanning, restricted access, and credential rotation. |

This is an architectural threat model, not a penetration-testing report. Revisit it when trust boundaries, data flows, identity providers, or deployment topology change.

## Security Verification

Before production, verify:

- OIDC login/logout and MFA integration with the configured identity provider.
- Session rotation, idle timeout, absolute lifetime, invalidation, and safe Redis-outage behavior.
- CSRF protection for state-changing methods and logout.
- RBAC and resource-level authorization, including HOD department isolation, faculty resource isolation, and class-advisor authorization.
- IDOR/BOLA attempts and client-supplied identifier/role/permission manipulation.
- XSS/input handling and SQL injection resistance.
- Rate limits, request body/query/pagination bounds, secure headers, and CORS policy.
- Report/export authorization and audit coverage for sensitive operations.
- Duty concurrency/capacity, duplicate assignment prevention, worker retry/idempotency, and Redis-independent correctness.
- Secret handling, database least privilege, backup/restore, and dependency/container vulnerabilities.

Use OWASP ASVS as the main security verification checklist and OWASP Top 10 as a baseline awareness reference. The institutional security owner approves the final assurance level before production. Security verification also includes a threat-model review and resolution or explicit acceptance of material findings.

## Institutional Decisions Before Production

The university security/identity owner approves step-up authentication policy, OIDC claim mapping and provisioning, session timeout values, assurance requirements, data-access rules, retention, and final security assurance level. Deployment owners define rate-limit thresholds, network boundaries, secret rotation procedures, backup/restore expectations, and operational access controls. These values and obligations are policy decisions, not assumptions supplied by this document.