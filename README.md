# University Faculty Portal

Foundation for a production-oriented university faculty portal. The backend is a modular monolith with the initial domain schema and persistence entities in place. The frontend currently demonstrates the planned faculty, HOD, and administrator workflows with mock data.

## Architecture and stack

- Backend: Java 21, Spring Boot, Maven, PostgreSQL, Flyway, Redis support, Spring Security dependency, Actuator, and OpenAPI support.
- Frontend: React, TypeScript, Vite, Tailwind CSS, ESLint, Prettier, and Lucide icons.
- Local infrastructure: Docker Compose with PostgreSQL, Redis, and a development/test Keycloak identity provider.

Backend module boundaries are under `backend/src/main/java/com/facultyportal/`: identity, authorization, organization, teaching, exam, allocation, performance, notification, audit, reporting, and shared/platform. They are structural boundaries in one Spring Boot application, not separate services.

## Repository structure

```text
backend/       Spring Boot modular-monolith foundation and Flyway migrations
frontend/      React application with mock portal workflows
docs/          Authoritative architecture and project specifications
infrastructure/Local infrastructure configuration
docker-compose.yml
.env.example
```

## Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 22+ and npm
- Docker Desktop or another Docker Compose-compatible engine

## Local infrastructure

Create a local `.env` from `.env.example`, replace the development-only password placeholders, then start the complete demo:

```sh
docker compose up --build
```

The working demo is available at `http://localhost:4173`. The backend API is available at `http://localhost:8080`, with demo health at `http://localhost:8080/api/demo/health` and Actuator health at `http://localhost:8080/actuator/health`.

PostgreSQL is available on `localhost:5432`, Redis on `localhost:6379`, and the development/test Keycloak console on `http://localhost:8081`. Keycloak is included for future SSO work but is not connected to application authentication in the demo.

## Run the backend

Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and optionally `DATABASE_URL` and `REDIS_HOST` in the backend process environment, then:

```sh
cd backend
mvn spring-boot:run
```

The only HTTP surface at this stage is the minimal Actuator health endpoint at `http://localhost:8080/actuator/health`. Flyway applies the initial schema in `backend/src/main/resources/db/migration/V1__initial_schema.sql`, including identity, organization, academic, examination, workload, notification, audit, and settings tables. Spring Security is present as a dependency, but authentication and application authorization are not configured.

## Run the frontend

```sh
cd frontend
npm install
npm run dev
```

Vite prints the local URL when the development server starts.

The frontend remains usable without infrastructure when run directly with Vite and currently uses in-memory mock services for its screens. The containerized demo also exposes the backend API so the frontend can be migrated screen-by-screen without changing the local setup.

## Demo API

The local backend provides a small working API for the first vertical slice:

```text
GET  /api/demo/health
GET  /api/demo/summary
GET  /api/demo/faculty
GET  /api/demo/duties
POST /api/demo/duties/{id}/select
```

The demo API requires Keycloak authentication and reads the seeded faculty, exam, duty, and assignment data from PostgreSQL. Duty selection is persisted transactionally in the database. The remaining production feature modules are still planned work.

## Keycloak demo authentication

Keycloak imports the `faculty-portal` realm automatically from `infrastructure/keycloak/faculty-portal-realm.json`. The frontend uses the public `faculty-portal-frontend` client with Authorization Code flow and PKCE. The backend validates bearer tokens against the realm's issuer and JWKS endpoint.

Demo users:

```text
Faculty: demo.faculty / demo123
Admin:   demo.admin   / demo123
```

Open `http://localhost:4173` and Keycloak will redirect to the login page. The Keycloak administration console is available at `http://localhost:8081` using the admin credentials from `.env`.

## Tests and quality checks

Backend:

```sh
cd backend
mvn test
mvn verify
```

Frontend:

```sh
cd frontend
npm run lint
npm test
npm run build
npm run format:check
```

The backend includes foundation health and database migration tests. The frontend includes a basic application test and static quality checks. Faculty, academic, duty, allocation, notification, HOD/Admin, authentication, and authorization workflows are represented in the frontend, but production backend APIs and institutional SSO are not implemented yet.
