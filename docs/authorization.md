# Authorization Model

This document is the authoritative authorization model and permission policy for the Faculty Portal. It defines logical capabilities and scope rules, not implementation code. Authorization decisions are made by the backend using current local identity and authoritative PostgreSQL relationships.

## Principals and Roles

The authenticated principal is a local `users` record linked to the stable OIDC `(issuer, subject)` pair. Authentication establishes who signed in; local active status, grants, permissions, and resource relationships establish what that principal may do.

The only global application roles are `ADMIN`, `HOD`, and `FACULTY`. A user may hold multiple active grants. `CLASS_ADVISOR` is not a global role: it is an additional, effective-dated scope derived from the user's faculty relationship and an active class-advisor appointment.

### Role-to-permission principle

- Roles are coarse-grained capability bundles.
- Permissions are stable identifiers used by authorization policy.
- Resource scope and current relationships are evaluated separately from a permission. Possessing a permission does not automatically grant access to every resource of that type.
- Permissions are additive across valid active grants, but each grant contributes only its associated scope. An unrelated grant cannot expand access beyond the resources it scopes. Expired or revoked grants do not contribute permissions.
- Current database state governs revocations and scope changes. Conflicting or ambiguous scope never broadens access. No separate deny-permission model is defined; missing required permission or scope means deny.
- `ADMIN` is system-wide only where an explicit permission and business purpose allow the action. `HOD` permissions are limited to active department scope. `FACULTY` permissions are limited to own, teaching, duty, and appointment-authorized resources. `CLASS_ADVISOR` contributes only its active class appointment scope.

### Stable permission identifiers

These are logical identifiers in the authorization contract, not database implementation details. Their names remain stable; assigning a permission to a role does not remove resource-scope checks.

| Identifier | Capability |
|---|---|
| `SYSTEM_CONFIG_READ` | Read permitted system configuration. |
| `SYSTEM_CONFIG_MANAGE` | Change permitted system configuration. |
| `FACULTY_READ` | Read faculty information within authorized scope. |
| `FACULTY_MANAGE` | Create, update, or deactivate faculty records within authorized scope. |
| `DEPARTMENT_READ` | Read department information within authorized scope. |
| `DEPARTMENT_MANAGE` | Manage department records. |
| `DESIGNATION_READ` | Read designation reference data. |
| `DESIGNATION_MANAGE` | Manage designation reference data. |
| `CLASS_READ` | Read classes and class information within authorized scope. |
| `CLASS_MANAGE` | Manage classes. |
| `SUBJECT_READ` | Read subjects and offerings within authorized scope. |
| `SUBJECT_MANAGE` | Manage subjects and offerings. |
| `TEACHING_ASSIGNMENT_READ` | Read faculty teaching assignments within authorized scope. |
| `TEACHING_ASSIGNMENT_MANAGE` | Manage faculty teaching assignments. |
| `CLASS_ADVISOR_READ` | Read advisor assignments and advisor-scoped class information. |
| `CLASS_ADVISOR_MANAGE` | Assign, change, or end class-advisor appointments. |
| `DUTY_READ` | Read duty information and duty reports within authorized scope. |
| `DUTY_SELECT` | Self-select an eligible duty for the authenticated faculty member. |
| `DUTY_ASSIGN` | Assign a duty administratively to a faculty member. |
| `DUTY_CANCEL` | Cancel an assignment or duty where permitted. |
| `DUTY_MANAGE` | Manage exam-duty lifecycle, capacity, eligibility, and selection windows. |
| `WORKLOAD_READ` | Read workload policies and obligations within authorized scope. |
| `WORKLOAD_MANAGE` | Manage designation workload policy. |
| `WORKLOAD_OBLIGATION_ADJUST` | Make an explicit, audited adjustment to a workload obligation. |
| `PERFORMANCE_READ` | Read student-level academic performance within authorized scope. |
| `PERFORMANCE_AGGREGATE_READ` | Read permitted class/department/system academic aggregates within authorized scope. |
| `PERFORMANCE_EXPORT` | Export authorized academic performance data. |
| `NOTIFICATION_READ` | Read the authenticated user's notifications. |
| `NOTIFICATION_UPDATE` | Update permitted fields, such as read state, on the authenticated user's notifications. |
| `AUDIT_READ` | Read audit events within explicitly authorized scope. |
| `REPORT_READ` | Read reports within authorized scope. |
| `REPORT_EXPORT` | Create/download report exports within authorized scope. |
| `ALLOCATION_RUN` | Start or retry an authorized duty-allocation run. |
| `ALLOCATION_READ` | Read allocation run status and results within authorized scope. |
| `USER_ROLE_READ` | Read user role and permission grants within authorized scope. |
| `USER_ROLE_MANAGE` | Grant, change, or revoke application roles/permissions within authorized scope. |

The matrix below describes default capability bundles, not unconditional access. A permission not explicitly available to a role is denied unless a separately approved, explicitly scoped grant is configured. The detailed endpoint contract remains in `docs/api-spec.md`.

| Capability group | ADMIN | HOD | FACULTY | CLASS_ADVISOR effect |
|---|---|---|---|---|
| System configuration and user-role management | Manage/read where explicitly granted | No by default | No | None |
| Faculty, department, designation, class, subject, and teaching administration | Manage/read where explicitly granted | Read only within active department scope where permitted | Own profile/read as permitted; no administrative management | No additional management capability |
| Advisor appointment administration | Manage/read where explicitly granted | No by default | No | No; appointment grants resource scope, not assignment management |
| Duty opening/read and department monitoring | Manage/read where explicitly granted | Department-scoped read where granted | Read eligible openings and own assignments | No expansion beyond the faculty member's own duty scope |
| Duty self-selection | Not by administrator identity alone | Only when also FACULTY, for own identity, with `DUTY_SELECT` | Own identity only with `DUTY_SELECT` | Same as FACULTY |
| Manual duty assignment/cancellation | `DUTY_ASSIGN` / `DUTY_CANCEL` with required reason/audit | No by default | No | No |
| Workload rules/obligations | Manage/adjust only with specific permission | Read within department if granted; no management by default | Own obligation read where granted; no management | No expansion beyond assigned class scope |
| Student performance | Permission-gated, purpose-limited, minimized, audited as required | Department-scoped aggregates by default; student-level access only if explicitly granted | `PERFORMANCE_READ` only through active teaching relationship | Advisor-scoped read across assigned class when permitted |
| Reports and exports | Explicit permission and resource scope | Department-scoped only where granted | Own teaching/advisor scope only where granted | Assigned class scope only where granted |
| Notifications | Own notifications | Own notifications | Own notifications | Own notifications |
| Audit | System audit only with `AUDIT_READ` | No system-wide access; department events only with explicit policy/permission | No by default | No additional access |
| Allocation | Run/read only with `ALLOCATION_RUN` / `ALLOCATION_READ` | Read department-scoped results where granted | No interactive run authority | No interactive run authority |

ADMIN is not automatically entitled to unrestricted student-record access on every endpoint. HOD does not automatically gain ADMIN permissions. Background automatic allocation is a system process, not an interactive user role.

## Authorization Decision Order

Evaluate authorization in this order:

1. Authenticate the principal.
2. Confirm the local user is active.
3. Resolve current local roles and permissions.
4. Resolve applicable department scope.
5. Resolve resource ownership/relationship.
6. Resolve effective dates/status.
7. Check the requested action/permission.
8. Apply resource-specific policy.
9. Deny by default if any required authorization information is missing or ambiguous.
10. For high-risk mutable commands, recheck relevant relationships inside the transaction.

**Authentication != authorization.** A valid OIDC session alone grants no academic or resource access. Authorization decisions use the current local account and authoritative PostgreSQL relationships; they do not trust role/scope claims or capabilities supplied by the client.

## Permission and Scope Model

Evaluate each decision as:

`ACTION/PERMISSION + PRINCIPAL + RESOURCE + SCOPE + CURRENT RELATIONSHIP + EFFECTIVE TIME`

Examples:

- `FACULTY + PERFORMANCE_READ + classSubject X` is allowed only if an active `faculty_subjects` relationship for this faculty identity authorizes offering X and the requested period.
- `CLASS_ADVISOR + PERFORMANCE_READ + class X` is allowed only if an active `class_advisors` appointment for the authenticated advisor faculty authorizes class X and the requested access falls within its effective period.
- `HOD + FACULTY_READ + faculty X` is allowed only if faculty X belongs to a department covered by the HOD's active grant at the relevant effective time.
- `ADMIN + FACULTY_MANAGE + faculty X` is allowed subject to the applicable administrative permission, business purpose, resource rules, and audit policy.

## Explicit Deny Rules

Deny access when any required condition fails, including:

- No authenticated principal exists, or the local user is inactive/deprovisioned.
- A required role or permission is absent.
- The HOD department grant is absent, inactive, expired, or does not cover the target department.
- The faculty teaching relationship is absent, inactive, expired, or for a different class offering.
- The class-advisor appointment is absent, inactive, expired, or for a different class.
- The relationship's effective dates do not cover the requested resource period.
- The target resource is outside the caller's scope.
- A resource relationship or authorization scope is ambiguous or cannot be verified.
- A request attempts to use a client-supplied role, permission, faculty ID, department scope, or other client value as proof of authorization.

There is no best-effort authorization. Missing required permission/scope means deny.

## Scope Policies

### ADMIN

ADMIN has system-wide administrative capability only for permissions explicitly granted to ADMIN and where business purpose permits. Access to sensitive student academic data is permission-gated, business-purpose limited, minimized, and audited where required. ADMIN does not automatically receive unrestricted access to every student record on every endpoint.

Administrative privilege never bypasses database integrity, duty capacity, duplicate assignment constraints, schedule-conflict invariants, or required audit/reason rules. High-risk operations require explicit permission and appropriate audit; recent authentication or IdP step-up MFA may be required according to `docs/security.md` and institutional policy.

### HOD

HOD department scope comes only from active local HOD grants. A user may have multiple HOD department grants if explicitly configured. Every department-scoped query checks the target department against current active grants. A caller-supplied `departmentId` is only a filter/request parameter, never proof of authorization. Cross-department access is denied by default.

HOD does not automatically gain ADMIN permissions, workload-management, role-management, duty-assignment, or system-configuration privileges. Department reports and audit events require their respective permission and remain department-scoped. HOD access to student-level records requires an explicit policy/permission; aggregate access does not imply student-level access.

### FACULTY

FACULTY may access:

- Their own profile and own duty assignments.
- Eligible duties available to their authenticated identity.
- Active teaching subjects and relationships.
- Student performance authorized through an active teaching relationship to the specific class subject/offering.
- Advisor-class information only through an active class-advisor appointment.
- Their own notifications.

FACULTY cannot view another faculty member's private assignments by changing an ID; access unrelated classes or students; access another department's academic data merely because a valid identifier is known; modify administrative configuration; manually assign duties; or modify another user's notifications. Any additional access requires an explicit permission and resource relationship; default remains deny.

### CLASS_ADVISOR

`CLASS_ADVISOR` is derived from an effective-dated `class_advisors` appointment. Authorization requires that the authenticated user's faculty identity matches the appointment, the target class matches that appointment, requested access falls within its effective period, and the requested operation is permitted for advisors.

When the appointment ends, advisor-specific authorization ends and previously presented frontend capabilities are stale. Future requests are denied unless another valid relationship grants access. Do not rely on a token/profile boolean such as `isAdvisor=true`; resolve the appointment and effective dates from current authoritative data.

### Teaching Relationships

Student-performance access requires an active teaching relationship to the specific class subject/offering. Check the faculty identity, exact class subject/offering, relationship active status, and applicable effective dates. Teaching the same subject in another class/offering does not grant access to this offering's students or records.

### Duty Authorization

- FACULTY may only self-select. The backend resolves faculty identity from the authenticated session; faculty cannot select on behalf of another faculty member.
- HOD receives no duty-assignment authority by virtue of the HOD role. HOD may read department-scoped duty reporting only where `DUTY_READ` or the appropriate report permission is granted.
- ADMIN may manage duty lifecycle and perform authorized manual assignments with `DUTY_MANAGE`/`DUTY_ASSIGN`; manual assignments require the required reason and audit. ADMIN authorization does not bypass capacity, duplicate, schedule-conflict, or database invariants.
- Automatic allocation uses the same authoritative transactional assignment service and is not an interactive user role. Job execution does not grant an application principal new access.

The detailed transaction and capacity model is defined in `docs/architecture.md` and `docs/database.md`.

### Reports and Exports

Report/export authorization is evaluated separately from the permission to view a screen. For each report, the caller needs the report/data permission and resource scope; filters are scope-checked; export creation and download are independently authorized; sensitive exports are audited; and short-lived access is preferred. Public object URLs are prohibited. A report endpoint cannot bypass authorization rules for its underlying records. Historical reporting requires a separately defined policy and does not automatically inherit current authorization.

### Notifications

`NOTIFICATION_READ` and `NOTIFICATION_UPDATE` apply only to the authenticated user's notifications. Notification ID substitution must not expose another user's notification. Users cannot change notification ownership, content, sender, type, timestamps, or delivery state through ordinary notification APIs. Administrative notification functionality, if introduced, requires an explicit permission and is not implied by ordinary notification access.

### Audit

ADMIN may read system audit data only with `AUDIT_READ` and subject to audit purpose/policy. HOD has no system-wide audit access; department-scoped audit access is allowed only if a specific permission/policy explicitly grants it. FACULTY has no audit-log access by default. Audit records cannot be modified through ordinary user-facing APIs.

## Effective Dates and Multiple Grants

Authorization-sensitive relationships may be effective-dated, including HOD department grants, faculty teaching assignments, class-advisor appointments, and other scoped assignments. A relationship outside its effective period cannot authorize access to records solely because it existed historically. Historical reporting requires a separately defined, explicitly authorized policy and does not automatically inherit current access.

Permissions are additive across valid active grants, but resource scope still applies independently. An unrelated grant cannot expand access beyond the resources it scopes. Inactive, expired, or revoked grants do not contribute permissions; revoked roles/permissions take effect according to current database state. Conflicting scope does not produce broader access through ambiguity. No explicit deny-overrides-allow model is introduced; missing required permission or scope means deny.

## Authorization-Scoped Data Access

- Enforce authorization as close to the data-access boundary as practical.
- Prefer authorization-scoped queries that retrieve only permitted records.
- Do not load broad datasets and filter them in React or application memory.
- A generic unscoped `findById` must not be the final authorization decision.
- List, detail, aggregate, report, export, and mutation operations all require authorization checks.
- Pagination, sorting, and filters must not allow a caller to enumerate records outside their scope.
- Recheck high-risk mutable relationships inside the transaction. A stale frontend capability is never authorization.

Repository/query scope is derived from the authenticated principal and current authoritative relationships, not trusted request IDs. For inaccessible detail resources, return `404` where resource existence should not be disclosed; otherwise use the safe API behavior defined in `docs/api-spec.md`. Authentication failures are `401`, authenticated but unauthorized requests are `403` where disclosure is safe, business-state conflicts are `409`, and semantic validation failures are `422`. Never reveal whether another user's student, faculty, or duty record exists merely because the caller supplied a valid ID.

## High-Risk Operations

The following require explicit permission and appropriate audit: role/permission changes; HOD scope changes; faculty lifecycle changes; workload policy changes; workload obligation adjustments; manual duty assignments; duty overrides; duty cancellation; advisor reassignment; sensitive report/export operations; and security configuration changes. Recent authentication or IdP step-up MFA may be required according to `docs/security.md` and institutional policy. Administrative commands also retain all resource-scope and business-invariant checks.

## Required Negative Test Matrix

Test authorization behavior at API and data-access boundaries. Tests must assert denial for unauthorized cases, not only successful access.

| Area | Required cases |
|---|---|
| Authentication | Unauthenticated request; inactive/deprovisioned user; expired session. |
| Faculty | Faculty accessing another faculty's assignments; changing `facultyId`; changing `departmentId`; accessing unrelated class; accessing unrelated student; accessing the same subject taught in another class; accessing an expired teaching relationship. |
| Class advisor | Advisor accessing assigned class while appointment is active; accessing another class; accessing after appointment expiry; former advisor accessing after reassignment. |
| HOD | Accessing authorized department; accessing another department; changing `departmentId` to bypass scope; attempting ADMIN operation; attempting manual duty assignment; attempting workload-policy modification. |
| Admin | Accessing permitted administrative resource; attempting operation without required permission; attempting to bypass business invariants. |
| Notifications | Notification ID substitution; notification ownership manipulation. |
| Reports | Out-of-scope report filters; out-of-scope export; download of another user's report job. |
| Role lifecycle | Revoked role; expired HOD grant; expired advisor appointment; deactivated faculty; changed department. |
| Concurrency/security | Duplicate duty selection; final-slot race; manipulated client-side role/permission; manipulated quota/capacity values. |

Include tests for missing/ambiguous permission or scope, class-subject mismatch, effective-date boundaries, and safe `401`/`403`/`404`/`409`/`422` behavior. Require integration tests against PostgreSQL for authorization-scoped queries and effective-dated relationships, not only controller annotation tests. Include list, detail, aggregate, report/export, and mutation paths so pagination or filtering cannot bypass policy.