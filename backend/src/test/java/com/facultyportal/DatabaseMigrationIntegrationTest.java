package com.facultyportal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.flywaydb.core.Flyway;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class DatabaseMigrationIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16.10-alpine");

    @BeforeAll
    static void migrateCleanDatabase() {
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    @Test
    void createsFoundationAndDeterministicReferenceSeeds() throws SQLException {
        try (Connection connection = openConnection()) {
            assertThat(queryLong(connection, "SELECT count(*) FROM flyway_schema_history WHERE success"))
                    .isEqualTo(1);
            assertThat(queryLong(connection, "SELECT count(*) FROM roles"))
                    .isEqualTo(3);
            assertThat(queryLong(connection, "SELECT count(*) FROM permissions"))
                    .isEqualTo(36);
            assertThat(queryLong(connection, "SELECT count(*) FROM designations"))
                    .isEqualTo(3);
            assertThat(queryLong(connection, "SELECT count(*) FROM designation_workload"))
                    .isEqualTo(3);
            assertThat(queryLong(connection, "SELECT count(*) FROM role_permissions"))
                    .isZero();
            assertThat(queryLong(connection,
                    "SELECT count(*) FROM information_schema.tables "
                        + "WHERE table_schema = 'public' AND table_type = 'BASE TABLE' "
                        + "AND table_name <> 'flyway_schema_history'"))
                    .isEqualTo(32);
            assertThat(queryLong(connection,
                    "SELECT required_duties FROM designation_workload w "
                            + "JOIN designations d ON d.id = w.designation_id WHERE d.code = 'PROFESSOR'"))
                    .isEqualTo(1);
            assertThat(queryLong(connection,
                    "SELECT required_duties FROM designation_workload w "
                            + "JOIN designations d ON d.id = w.designation_id "
                            + "WHERE d.code = 'ASSOCIATE_PROFESSOR'"))
                    .isEqualTo(2);
            assertThat(queryLong(connection,
                    "SELECT required_duties FROM designation_workload w "
                            + "JOIN designations d ON d.id = w.designation_id "
                            + "WHERE d.code = 'ASSISTANT_PROFESSOR'"))
                    .isEqualTo(6);
        }
    }

    @Test
    void enforcesOidcForeignKeyAndHodScopeConstraints() throws SQLException {
        try (Connection connection = openConnection()) {
            UUID userId = insertUser(connection, "identity-one");

            assertSqlState("23505", () -> insertUser(connection, "identity-one"));
            assertSqlState("23503", () -> {
                try (PreparedStatement statement = connection.prepareStatement(
                        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)")) {
                    statement.setObject(1, UUID.randomUUID());
                    statement.setObject(2, UUID.randomUUID());
                    statement.executeUpdate();
                }
            });
            assertSqlState("23514", () -> {
                try (PreparedStatement statement = connection.prepareStatement(
                        "INSERT INTO user_roles (user_id, role_id, department_id, granted_by) "
                                + "SELECT ?, id, NULL, ? FROM roles WHERE code = 'HOD'")) {
                    statement.setObject(1, userId);
                    statement.setObject(2, userId);
                    statement.executeUpdate();
                }
            });
        }
    }

    @Test
    void enforcesOneActiveEnrollmentPerStudentAndAcademicYear() throws SQLException {
        try (Connection connection = openConnection()) {
            UUID departmentId = insertDepartment(connection);
            UUID academicYearId = insertAcademicYear(connection);
            UUID firstClassId = insertClass(connection, departmentId, academicYearId, "CSE-A");
            UUID secondClassId = insertClass(connection, departmentId, academicYearId, "CSE-B");
            UUID studentId = insertStudent(connection);

            insertEnrollment(connection, studentId, firstClassId, academicYearId);
            assertSqlState("23505", () -> insertEnrollment(connection, studentId, secondClassId, academicYearId));
        }
    }

    @Test
    void preventsOverlappingAdvisorAndWorkloadPeriods() throws SQLException {
        try (Connection connection = openConnection()) {
            UUID actorId = insertUser(connection, "advisor-actor");
            UUID facultyOne = insertFaculty(connection, "advisor-one");
            UUID facultyTwo = insertFaculty(connection, "advisor-two");
            UUID departmentId = insertDepartment(connection);
            UUID academicYearId = insertAcademicYear(connection);
            UUID classId = insertClass(connection, departmentId, academicYearId, "CSE-ADVISOR");

            insertAdvisor(connection, facultyOne, classId, actorId, LocalDate.parse("2026-01-01"), null);
            assertSqlState("23P01", () -> insertAdvisor(
                    connection, facultyTwo, classId, actorId, LocalDate.parse("2026-06-01"), null));

            UUID designationId = queryUuid(connection,
                    "SELECT id FROM designations WHERE code = 'PROFESSOR'");
                try (PreparedStatement statement = connection.prepareStatement(
                    "UPDATE designation_workload SET effective_to = DATE '2026-01-01' "
                        + "WHERE designation_id = ? AND effective_from = DATE '2000-01-01'")) {
                statement.setObject(1, designationId);
                statement.executeUpdate();
                }
            UUID firstPolicyId = insertWorkload(connection, designationId, 1,
                    LocalDate.parse("2026-01-01"), LocalDate.parse("2027-01-01"), actorId);
            assertThat(firstPolicyId).isNotNull();
            assertSqlState("23P01", () -> insertWorkload(connection, designationId, 2,
                    LocalDate.parse("2026-06-01"), null, actorId));
        }
    }

    @Test
    void enforcesDutyEligibilityModeAndActiveAssignmentUniqueness() throws SQLException {
        try (Connection connection = openConnection()) {
            UUID actorId = insertUser(connection, "duty-actor");
            UUID departmentId = insertDepartment(connection);
            UUID facultyId = insertFaculty(connection, "duty-faculty");
            UUID examId = insertExam(connection, departmentId);
            UUID dutyId = UUID.randomUUID();

            assertSqlState("23514", () -> insertDuty(connection, dutyId, examId, actorId, "RESTRICTED"));
            UUID restrictedDutyId = UUID.randomUUID();
            connection.setAutoCommit(false);
            insertDuty(connection, restrictedDutyId, examId, actorId, "RESTRICTED");
            try (PreparedStatement statement = connection.prepareStatement(
                    "INSERT INTO duty_eligible_departments (exam_duty_id, department_id) VALUES (?, ?)")) {
                statement.setObject(1, restrictedDutyId);
                statement.setObject(2, departmentId);
                statement.executeUpdate();
            }
            connection.commit();
            connection.setAutoCommit(true);

            UUID workloadId = queryUuid(connection,
                    "SELECT w.id FROM designation_workload w JOIN designations d ON d.id = w.designation_id "
                            + "WHERE d.code = 'PROFESSOR'");
            UUID obligationId = insertObligation(connection, facultyId, workloadId);
            UUID openDutyId = insertDuty(connection, UUID.randomUUID(), examId, actorId, "ALL");
            insertAssignment(connection, openDutyId, facultyId, obligationId);
            assertSqlState("23505", () -> insertAssignment(connection, openDutyId, facultyId, obligationId));
        }
    }

    private static Connection openConnection() throws SQLException {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private static long queryLong(Connection connection, String query) throws SQLException {
        try (Statement statement = connection.createStatement();
                var result = statement.executeQuery(query)) {
            result.next();
            return result.getLong(1);
        }
    }

    private static UUID queryUuid(Connection connection, String query) throws SQLException {
        try (Statement statement = connection.createStatement();
                var result = statement.executeQuery(query)) {
            result.next();
            return result.getObject(1, UUID.class);
        }
    }

    private static void assertSqlState(String expectedState, SqlAction action) {
        SQLException exception = assertThrows(SQLException.class, action::run);
        assertThat(exception.getSQLState()).isEqualTo(expectedState);
    }

    private static UUID insertUser(Connection connection, String subjectSuffix) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO users (id, oidc_issuer, oidc_subject, display_name) VALUES (?, ?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setString(2, "https://idp.example.edu/issuer");
            statement.setString(3, subjectSuffix);
            statement.setString(4, "Test User " + subjectSuffix);
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertDepartment(Connection connection) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO departments (id, code, name) VALUES (?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setString(2, "DEPT-" + id);
            statement.setString(3, "Test Department");
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertAcademicYear(Connection connection) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO academic_years (id, code, starts_on, ends_on) VALUES (?, ?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setString(2, "AY-" + id);
            statement.setObject(3, LocalDate.parse("2026-01-01"));
            statement.setObject(4, LocalDate.parse("2026-12-31"));
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertClass(Connection connection, UUID departmentId, UUID academicYearId, String code)
            throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO academic_classes (id, department_id, academic_year_id, code) VALUES (?, ?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setObject(2, departmentId);
            statement.setObject(3, academicYearId);
            statement.setString(4, code);
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertStudent(Connection connection) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO students (id, student_number, display_name) VALUES (?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setString(2, "STU-" + id);
            statement.setString(3, "Test Student");
            statement.executeUpdate();
        }
        return id;
    }

    private static void insertEnrollment(
            Connection connection, UUID studentId, UUID classId, UUID academicYearId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO class_enrollments "
                        + "(student_id, academic_class_id, academic_year_id, valid_from) VALUES (?, ?, ?, ?)")) {
            statement.setObject(1, studentId);
            statement.setObject(2, classId);
            statement.setObject(3, academicYearId);
            statement.setObject(4, LocalDate.parse("2026-01-01"));
            statement.executeUpdate();
        }
    }

    private static UUID insertFaculty(Connection connection, String suffix) throws SQLException {
        UUID id = UUID.randomUUID();
        UUID userId = insertUser(connection, suffix);
        UUID departmentId = insertDepartment(connection);
        UUID designationId = queryUuid(connection,
                "SELECT id FROM designations WHERE code = 'PROFESSOR'");
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO faculty (id, user_id, employee_id, department_id, designation_id, employment_status) "
                        + "VALUES (?, ?, ?, ?, ?, 'ACTIVE')")) {
            statement.setObject(1, id);
            statement.setObject(2, userId);
            statement.setString(3, "EMP-" + id);
            statement.setObject(4, departmentId);
            statement.setObject(5, designationId);
            statement.executeUpdate();
        }
        return id;
    }

    private static void insertAdvisor(
            Connection connection, UUID facultyId, UUID classId, UUID actorId, LocalDate from, LocalDate to)
            throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO class_advisors (faculty_id, academic_class_id, valid_from, valid_to, assigned_by) "
                        + "VALUES (?, ?, ?, ?, ?)")) {
            statement.setObject(1, facultyId);
            statement.setObject(2, classId);
            statement.setObject(3, from);
            statement.setObject(4, to);
            statement.setObject(5, actorId);
            statement.executeUpdate();
        }
    }

    private static UUID insertWorkload(
            Connection connection, UUID designationId, int count, LocalDate from, LocalDate to, UUID actorId)
            throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO designation_workload "
                        + "(id, designation_id, required_duties, effective_from, effective_to, created_by) "
                        + "VALUES (?, ?, ?, ?, ?, ?)")) {
            statement.setObject(1, id);
            statement.setObject(2, designationId);
            statement.setInt(3, count);
            statement.setObject(4, from);
            statement.setObject(5, to);
            statement.setObject(6, actorId);
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertExam(Connection connection, UUID departmentId) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO exams (id, name, department_id, status) VALUES (?, ?, ?, 'SCHEDULED')")) {
            statement.setObject(1, id);
            statement.setString(2, "Test Exam");
            statement.setObject(3, departmentId);
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertDuty(
            Connection connection, UUID id, UUID examId, UUID actorId, String eligibilityMode) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO exam_duties "
                        + "(id, exam_id, title, starts_at, ends_at, venue, capacity, eligibility_mode, status, created_by) "
                        + "VALUES (?, ?, 'Test Duty', '2026-10-10 09:00:00+00', '2026-10-10 11:00:00+00', "
                        + "'Test Venue', 2, ?, 'OPEN', ?)")) {
            statement.setObject(1, id);
            statement.setObject(2, examId);
            statement.setString(3, eligibilityMode);
            statement.setObject(4, actorId);
            statement.executeUpdate();
        }
        return id;
    }

    private static UUID insertObligation(Connection connection, UUID facultyId, UUID policyId) throws SQLException {
        UUID id = UUID.randomUUID();
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO faculty_duty_obligations "
                        + "(id, faculty_id, period_start, required_count, policy_id) "
                        + "VALUES (?, ?, DATE '2026-10-01', 1, ?)")) {
            statement.setObject(1, id);
            statement.setObject(2, facultyId);
            statement.setObject(3, policyId);
            statement.executeUpdate();
        }
        return id;
    }

    private static void insertAssignment(Connection connection, UUID dutyId, UUID facultyId, UUID obligationId)
            throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO duty_assignments (exam_duty_id, faculty_id, obligation_id, assignment_type) "
                        + "VALUES (?, ?, ?, 'SELF_SELECTED')")) {
            statement.setObject(1, dutyId);
            statement.setObject(2, facultyId);
            statement.setObject(3, obligationId);
            statement.executeUpdate();
        }
    }

    @FunctionalInterface
    private interface SqlAction {
        void run() throws SQLException;
    }
}