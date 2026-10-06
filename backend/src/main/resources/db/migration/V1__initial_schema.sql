CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    oidc_issuer varchar(512) NOT NULL,
    oidc_subject varchar(512) NOT NULL,
    employee_id varchar(128),
    display_name varchar(256) NOT NULL,
    email varchar(320),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_oidc_identity UNIQUE (oidc_issuer, oidc_subject),
    CONSTRAINT ck_users_display_name_nonempty CHECK (btrim(display_name) <> '')
);

CREATE UNIQUE INDEX uq_users_employee_id_present
    ON users (employee_id)
    WHERE employee_id IS NOT NULL;

CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(64) NOT NULL UNIQUE,
    description varchar(512) NOT NULL,
    system_managed boolean NOT NULL DEFAULT true,
    CONSTRAINT ck_roles_code_nonempty CHECK (btrim(code) <> '')
);

CREATE TABLE permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(96) NOT NULL UNIQUE,
    description varchar(512) NOT NULL,
    CONSTRAINT ck_permissions_code_nonempty CHECK (btrim(code) <> '')
);

CREATE TABLE role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
        REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id)
        REFERENCES permissions (id) ON DELETE RESTRICT
);

CREATE INDEX ix_role_permissions_permission_id ON role_permissions (permission_id);

CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(64) NOT NULL UNIQUE,
    name varchar(256) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_departments_code_nonempty CHECK (btrim(code) <> ''),
    CONSTRAINT ck_departments_name_nonempty CHECK (btrim(name) <> '')
);

CREATE TABLE user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    department_id uuid,
    granted_by uuid NOT NULL,
    granted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamptz,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_granted_by FOREIGN KEY (granted_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_user_roles_revocation CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

CREATE UNIQUE INDEX uq_user_roles_active_scope
    ON user_roles (user_id, role_id, department_id) NULLS NOT DISTINCT
    WHERE revoked_at IS NULL;
CREATE INDEX ix_user_roles_user_id ON user_roles (user_id);
CREATE INDEX ix_user_roles_role_id ON user_roles (role_id);
CREATE INDEX ix_user_roles_department_id ON user_roles (department_id);
CREATE INDEX ix_user_roles_granted_by ON user_roles (granted_by);

CREATE FUNCTION enforce_hod_department_scope() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    role_code varchar(64);
BEGIN
    SELECT code INTO role_code FROM roles WHERE id = NEW.role_id;
    IF role_code = 'HOD' AND NEW.department_id IS NULL THEN
        RAISE EXCEPTION 'HOD role grants require a department scope'
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_roles_hod_department_scope
    BEFORE INSERT OR UPDATE OF role_id, department_id ON user_roles
    FOR EACH ROW EXECUTE FUNCTION enforce_hod_department_scope();

CREATE TABLE designations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(64) NOT NULL UNIQUE,
    name varchar(128) NOT NULL UNIQUE,
    active boolean NOT NULL DEFAULT true,
    CONSTRAINT ck_designations_code_nonempty CHECK (btrim(code) <> ''),
    CONSTRAINT ck_designations_name_nonempty CHECK (btrim(name) <> '')
);

CREATE TABLE faculty (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    employee_id varchar(128) NOT NULL UNIQUE,
    department_id uuid NOT NULL,
    designation_id uuid NOT NULL,
    employment_status varchar(64) NOT NULL,
    joined_on date,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_faculty_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_faculty_designation FOREIGN KEY (designation_id)
        REFERENCES designations (id) ON DELETE RESTRICT,
    CONSTRAINT ck_faculty_employee_id_nonempty CHECK (btrim(employee_id) <> ''),
    CONSTRAINT ck_faculty_employment_status_nonempty CHECK (btrim(employment_status) <> '')
);

CREATE INDEX ix_faculty_department_id ON faculty (department_id);
CREATE INDEX ix_faculty_designation_id ON faculty (designation_id);

CREATE TABLE academic_years (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(64) NOT NULL UNIQUE,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    active boolean NOT NULL DEFAULT true,
    CONSTRAINT ck_academic_years_code_nonempty CHECK (btrim(code) <> ''),
    CONSTRAINT ck_academic_years_dates CHECK (starts_on <= ends_on)
);

CREATE TABLE academic_classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    code varchar(64) NOT NULL,
    year_of_study smallint,
    section varchar(32),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_classes_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_academic_classes_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT uq_academic_classes_department_year_code
        UNIQUE (department_id, academic_year_id, code),
    CONSTRAINT uq_academic_classes_id_year UNIQUE (id, academic_year_id),
    CONSTRAINT ck_academic_classes_code_nonempty CHECK (btrim(code) <> '')
);

CREATE INDEX ix_academic_classes_academic_year_id ON academic_classes (academic_year_id);

CREATE TABLE students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number varchar(128) NOT NULL UNIQUE,
    display_name varchar(256) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_students_number_nonempty CHECK (btrim(student_number) <> ''),
    CONSTRAINT ck_students_display_name_nonempty CHECK (btrim(display_name) <> '')
);

CREATE TABLE class_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    academic_class_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    status varchar(32) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_enrollments_student FOREIGN KEY (student_id)
        REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_enrollments_class_year FOREIGN KEY (academic_class_id, academic_year_id)
        REFERENCES academic_classes (id, academic_year_id) ON DELETE RESTRICT,
    CONSTRAINT ck_class_enrollments_status CHECK (status IN ('ACTIVE', 'CLOSED')),
    CONSTRAINT ck_class_enrollments_dates CHECK (valid_to IS NULL OR valid_to > valid_from)
);

CREATE UNIQUE INDEX uq_class_enrollments_active_student_year
    ON class_enrollments (student_id, academic_year_id)
    WHERE status = 'ACTIVE';
CREATE INDEX ix_class_enrollments_student_id ON class_enrollments (student_id);
CREATE INDEX ix_class_enrollments_academic_class_id ON class_enrollments (academic_class_id);
CREATE INDEX ix_class_enrollments_academic_year_id ON class_enrollments (academic_year_id);

CREATE TABLE subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid NOT NULL,
    code varchar(64) NOT NULL,
    name varchar(256) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT uq_subjects_department_code UNIQUE (department_id, code),
    CONSTRAINT ck_subjects_code_nonempty CHECK (btrim(code) <> ''),
    CONSTRAINT ck_subjects_name_nonempty CHECK (btrim(name) <> '')
);

CREATE INDEX ix_subjects_department_id ON subjects (department_id);

CREATE TABLE class_subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    term varchar(64) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_subjects_class FOREIGN KEY (academic_class_id)
        REFERENCES academic_classes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE RESTRICT,
    CONSTRAINT uq_class_subjects_offering UNIQUE (academic_class_id, subject_id, term),
    CONSTRAINT ck_class_subjects_term_nonempty CHECK (btrim(term) <> '')
);

CREATE INDEX ix_class_subjects_subject_id ON class_subjects (subject_id);

CREATE TABLE faculty_subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id uuid NOT NULL,
    class_subject_id uuid NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_subjects_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_faculty_subjects_class_subject FOREIGN KEY (class_subject_id)
        REFERENCES class_subjects (id) ON DELETE RESTRICT,
    CONSTRAINT ck_faculty_subjects_dates CHECK (valid_to IS NULL OR valid_to > valid_from)
);

CREATE UNIQUE INDEX uq_faculty_subjects_active_pair
    ON faculty_subjects (faculty_id, class_subject_id)
    WHERE active;
CREATE INDEX ix_faculty_subjects_faculty_id ON faculty_subjects (faculty_id);
CREATE INDEX ix_faculty_subjects_class_subject_id ON faculty_subjects (class_subject_id);

CREATE TABLE class_advisors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id uuid NOT NULL,
    academic_class_id uuid NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    assigned_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_advisors_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_advisors_class FOREIGN KEY (academic_class_id)
        REFERENCES academic_classes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_advisors_assigned_by FOREIGN KEY (assigned_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_class_advisors_dates CHECK (valid_to IS NULL OR valid_to > valid_from),
    CONSTRAINT ex_class_advisors_no_class_overlap
        EXCLUDE USING gist (
            academic_class_id WITH =,
            (daterange(valid_from, COALESCE(valid_to, 'infinity'::date), '[)')) WITH &&
        )
);

CREATE INDEX ix_class_advisors_faculty_id ON class_advisors (faculty_id);
CREATE INDEX ix_class_advisors_assigned_by ON class_advisors (assigned_by);

CREATE TABLE exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(256) NOT NULL,
    academic_year_id uuid,
    department_id uuid,
    starts_on date,
    ends_on date,
    status varchar(64) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exams_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exams_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT ck_exams_name_nonempty CHECK (btrim(name) <> ''),
    CONSTRAINT ck_exams_status_nonempty CHECK (btrim(status) <> ''),
    CONSTRAINT ck_exams_dates CHECK (starts_on IS NULL OR ends_on IS NULL OR starts_on <= ends_on)
);

CREATE INDEX ix_exams_academic_year_id ON exams (academic_year_id);
CREATE INDEX ix_exams_department_id ON exams (department_id);

CREATE TABLE exam_duties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id uuid NOT NULL,
    title varchar(256) NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    venue varchar(256) NOT NULL,
    capacity integer NOT NULL,
    eligibility_mode varchar(16) NOT NULL,
    selection_opens_at timestamptz,
    selection_closes_at timestamptz,
    status varchar(16) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_duties_exam FOREIGN KEY (exam_id)
        REFERENCES exams (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exam_duties_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_exam_duties_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT ck_exam_duties_venue_nonempty CHECK (btrim(venue) <> ''),
    CONSTRAINT ck_exam_duties_capacity CHECK (capacity > 0),
    CONSTRAINT ck_exam_duties_eligibility_mode CHECK (eligibility_mode IN ('ALL', 'RESTRICTED')),
    CONSTRAINT ck_exam_duties_status CHECK (status IN ('OPEN', 'FULL', 'CLOSED', 'CANCELLED')),
    CONSTRAINT ck_exam_duties_time_range CHECK (starts_at < ends_at),
    CONSTRAINT ck_exam_duties_selection_window CHECK (
        selection_opens_at IS NULL OR selection_closes_at IS NULL OR selection_opens_at < selection_closes_at
    )
);

CREATE INDEX ix_exam_duties_exam_id ON exam_duties (exam_id);
CREATE INDEX ix_exam_duties_created_by ON exam_duties (created_by);
CREATE INDEX ix_exam_duties_status_window ON exam_duties (status, selection_opens_at, selection_closes_at);
CREATE INDEX ix_exam_duties_time_range ON exam_duties (starts_at, ends_at);

CREATE TABLE duty_eligible_departments (
    exam_duty_id uuid NOT NULL,
    department_id uuid NOT NULL,
    CONSTRAINT pk_duty_eligible_departments PRIMARY KEY (exam_duty_id, department_id),
    CONSTRAINT fk_duty_eligible_departments_duty FOREIGN KEY (exam_duty_id)
        REFERENCES exam_duties (id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_eligible_departments_department FOREIGN KEY (department_id)
        REFERENCES departments (id) ON DELETE RESTRICT
);

CREATE INDEX ix_duty_eligible_departments_department_id ON duty_eligible_departments (department_id);

CREATE TABLE duty_eligible_designations (
    exam_duty_id uuid NOT NULL,
    designation_id uuid NOT NULL,
    CONSTRAINT pk_duty_eligible_designations PRIMARY KEY (exam_duty_id, designation_id),
    CONSTRAINT fk_duty_eligible_designations_duty FOREIGN KEY (exam_duty_id)
        REFERENCES exam_duties (id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_eligible_designations_designation FOREIGN KEY (designation_id)
        REFERENCES designations (id) ON DELETE RESTRICT
);

CREATE INDEX ix_duty_eligible_designations_designation_id ON duty_eligible_designations (designation_id);

CREATE FUNCTION assert_exam_duty_eligibility_mode(target_duty_id uuid) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    duty_mode varchar(16);
    mapping_count bigint;
BEGIN
    SELECT eligibility_mode INTO duty_mode
    FROM exam_duties
    WHERE id = target_duty_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    SELECT
        (SELECT count(*) FROM duty_eligible_departments WHERE exam_duty_id = target_duty_id)
        + (SELECT count(*) FROM duty_eligible_designations WHERE exam_duty_id = target_duty_id)
    INTO mapping_count;

    IF duty_mode = 'ALL' AND mapping_count > 0 THEN
        RAISE EXCEPTION 'ALL eligibility mode cannot have department or designation mappings'
            USING ERRCODE = '23514';
    ELSIF duty_mode = 'RESTRICTED' AND mapping_count = 0 THEN
        RAISE EXCEPTION 'RESTRICTED eligibility mode requires at least one eligibility mapping'
            USING ERRCODE = '23514';
    END IF;
END;
$$;

CREATE FUNCTION validate_exam_duty_eligibility_mode_trigger() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_TABLE_NAME = 'exam_duties' THEN
        IF TG_OP <> 'DELETE' THEN
            PERFORM assert_exam_duty_eligibility_mode(NEW.id);
        END IF;
    ELSE
        IF TG_OP <> 'INSERT' THEN
            PERFORM assert_exam_duty_eligibility_mode(OLD.exam_duty_id);
        END IF;
        IF TG_OP <> 'DELETE'
            AND (TG_OP <> 'UPDATE' OR NEW.exam_duty_id IS DISTINCT FROM OLD.exam_duty_id) THEN
            PERFORM assert_exam_duty_eligibility_mode(NEW.exam_duty_id);
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER ct_exam_duties_eligibility_mode
    AFTER INSERT OR UPDATE ON exam_duties
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION validate_exam_duty_eligibility_mode_trigger();

CREATE CONSTRAINT TRIGGER ct_duty_eligible_departments_mode
    AFTER INSERT OR UPDATE OR DELETE ON duty_eligible_departments
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION validate_exam_duty_eligibility_mode_trigger();

CREATE CONSTRAINT TRIGGER ct_duty_eligible_designations_mode
    AFTER INSERT OR UPDATE OR DELETE ON duty_eligible_designations
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION validate_exam_duty_eligibility_mode_trigger();

CREATE TABLE designation_workload (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    designation_id uuid NOT NULL,
    required_duties integer NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_designation_workload_designation FOREIGN KEY (designation_id)
        REFERENCES designations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_designation_workload_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_designation_workload_effective_start UNIQUE (designation_id, effective_from),
    CONSTRAINT ck_designation_workload_required CHECK (required_duties >= 0),
    CONSTRAINT ck_designation_workload_dates CHECK (effective_to IS NULL OR effective_to > effective_from),
    CONSTRAINT ex_designation_workload_no_overlap
        EXCLUDE USING gist (
            designation_id WITH =,
            (daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[)')) WITH &&
        )
);

CREATE INDEX ix_designation_workload_created_by ON designation_workload (created_by);

CREATE TABLE faculty_duty_obligations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id uuid NOT NULL,
    period_start date NOT NULL,
    required_count integer NOT NULL,
    policy_id uuid NOT NULL,
    status varchar(16) NOT NULL DEFAULT 'OPEN',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_duty_obligations_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_faculty_duty_obligations_policy FOREIGN KEY (policy_id)
        REFERENCES designation_workload (id) ON DELETE RESTRICT,
    CONSTRAINT uq_faculty_duty_obligations_faculty_period UNIQUE (faculty_id, period_start),
    CONSTRAINT uq_faculty_duty_obligations_id_faculty UNIQUE (id, faculty_id),
    CONSTRAINT ck_faculty_duty_obligations_period CHECK (EXTRACT(DAY FROM period_start) = 1),
    CONSTRAINT ck_faculty_duty_obligations_count CHECK (required_count >= 0),
    CONSTRAINT ck_faculty_duty_obligations_status CHECK (status IN ('OPEN', 'FINALIZED', 'EXEMPT'))
);

CREATE INDEX ix_faculty_duty_obligations_policy_id ON faculty_duty_obligations (policy_id);

CREATE TABLE duty_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_duty_id uuid NOT NULL,
    faculty_id uuid NOT NULL,
    obligation_id uuid,
    assignment_type varchar(16) NOT NULL,
    status varchar(16) NOT NULL DEFAULT 'ACTIVE',
    assigned_by uuid,
    assigned_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_by uuid,
    cancelled_at timestamptz,
    cancellation_reason varchar(1024),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_duty_assignments_duty FOREIGN KEY (exam_duty_id)
        REFERENCES exam_duties (id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_assignments_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_assignments_obligation_faculty FOREIGN KEY (obligation_id, faculty_id)
        REFERENCES faculty_duty_obligations (id, faculty_id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_assignments_assigned_by FOREIGN KEY (assigned_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_duty_assignments_cancelled_by FOREIGN KEY (cancelled_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_duty_assignments_type CHECK (assignment_type IN ('SELF_SELECTED', 'AUTO_ASSIGNED', 'ADMIN_ASSIGNED')),
    CONSTRAINT ck_duty_assignments_status CHECK (status IN ('ACTIVE', 'CANCELLED')),
    CONSTRAINT ck_duty_assignments_cancellation CHECK (
        (status = 'ACTIVE' AND cancelled_at IS NULL AND cancelled_by IS NULL)
        OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uq_duty_assignments_active_duty_faculty
    ON duty_assignments (exam_duty_id, faculty_id)
    WHERE status = 'ACTIVE';
CREATE INDEX ix_duty_assignments_exam_duty_id ON duty_assignments (exam_duty_id);
CREATE INDEX ix_duty_assignments_faculty_assigned_at ON duty_assignments (faculty_id, assigned_at DESC);
CREATE INDEX ix_duty_assignments_obligation_id ON duty_assignments (obligation_id);
CREATE INDEX ix_duty_assignments_assigned_by ON duty_assignments (assigned_by);
CREATE INDEX ix_duty_assignments_cancelled_by ON duty_assignments (cancelled_by);

CREATE TABLE academic_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_subject_id uuid NOT NULL,
    name varchar(256) NOT NULL,
    assessment_date date NOT NULL,
    max_marks numeric(7, 2) NOT NULL,
    term varchar(64) NOT NULL,
    status varchar(64) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_assessments_class_subject FOREIGN KEY (class_subject_id)
        REFERENCES class_subjects (id) ON DELETE RESTRICT,
    CONSTRAINT ck_academic_assessments_name_nonempty CHECK (btrim(name) <> ''),
    CONSTRAINT ck_academic_assessments_term_nonempty CHECK (btrim(term) <> ''),
    CONSTRAINT ck_academic_assessments_status_nonempty CHECK (btrim(status) <> ''),
    CONSTRAINT ck_academic_assessments_max_marks CHECK (max_marks > 0)
);

CREATE INDEX ix_academic_assessments_class_subject_date
    ON academic_assessments (class_subject_id, assessment_date);

CREATE TABLE grade_scale_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scale_code varchar(64) NOT NULL,
    grade_code varchar(32) NOT NULL,
    minimum_percent numeric(5, 2) NOT NULL,
    maximum_percent numeric(5, 2) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    CONSTRAINT uq_grade_scale_entries_scale_grade UNIQUE (scale_code, grade_code),
    CONSTRAINT ck_grade_scale_entries_scale_nonempty CHECK (btrim(scale_code) <> ''),
    CONSTRAINT ck_grade_scale_entries_grade_nonempty CHECK (btrim(grade_code) <> ''),
    CONSTRAINT ck_grade_scale_entries_range CHECK (
        minimum_percent >= 0 AND maximum_percent <= 100 AND minimum_percent < maximum_percent
    ),
    CONSTRAINT ex_grade_scale_entries_no_overlap
        EXCLUDE USING gist (
            scale_code WITH =,
            (numrange(minimum_percent, maximum_percent, '[)')) WITH &&
        )
);

CREATE TABLE student_marks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    marks_obtained numeric(7, 2) NOT NULL,
    recorded_by uuid NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_marks_assessment FOREIGN KEY (assessment_id)
        REFERENCES academic_assessments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_marks_student FOREIGN KEY (student_id)
        REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_marks_recorded_by FOREIGN KEY (recorded_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_student_marks_assessment_student UNIQUE (assessment_id, student_id),
    CONSTRAINT ck_student_marks_nonnegative CHECK (marks_obtained >= 0)
);

CREATE INDEX ix_student_marks_student_id ON student_marks (student_id);
CREATE INDEX ix_student_marks_recorded_by ON student_marks (recorded_by);

CREATE TABLE attendance_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_subject_id uuid NOT NULL,
    held_at timestamptz NOT NULL,
    session_label varchar(256),
    status varchar(64) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_sessions_class_subject FOREIGN KEY (class_subject_id)
        REFERENCES class_subjects (id) ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_sessions_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_attendance_sessions_status_nonempty CHECK (btrim(status) <> '')
);

CREATE INDEX ix_attendance_sessions_class_subject_held_at
    ON attendance_sessions (class_subject_id, held_at);
CREATE INDEX ix_attendance_sessions_created_by ON attendance_sessions (created_by);

CREATE TABLE student_attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status varchar(16) NOT NULL,
    recorded_by uuid NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_attendance_session FOREIGN KEY (attendance_session_id)
        REFERENCES attendance_sessions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_attendance_student FOREIGN KEY (student_id)
        REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_attendance_recorded_by FOREIGN KEY (recorded_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_student_attendance_session_student UNIQUE (attendance_session_id, student_id),
    CONSTRAINT ck_student_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'EXCUSED'))
);

CREATE INDEX ix_student_attendance_student_session
    ON student_attendance (student_id, attendance_session_id);
CREATE INDEX ix_student_attendance_recorded_by ON student_attendance (recorded_by);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type varchar(64) NOT NULL,
    title varchar(256) NOT NULL,
    body text NOT NULL,
    resource_type varchar(64),
    resource_id uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at timestamptz,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_notifications_type_nonempty CHECK (btrim(type) <> ''),
    CONSTRAINT ck_notifications_title_nonempty CHECK (btrim(title) <> '')
);

CREATE INDEX ix_notifications_user_created_at ON notifications (user_id, created_at DESC);

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid,
    action varchar(128) NOT NULL,
    entity_type varchar(128) NOT NULL,
    entity_id varchar(256) NOT NULL,
    old_value jsonb,
    new_value jsonb,
    occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_ip inet,
    request_id varchar(128),
    outcome varchar(64) NOT NULL,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_audit_logs_action_nonempty CHECK (btrim(action) <> ''),
    CONSTRAINT ck_audit_logs_entity_type_nonempty CHECK (btrim(entity_type) <> ''),
    CONSTRAINT ck_audit_logs_entity_id_nonempty CHECK (btrim(entity_id) <> ''),
    CONSTRAINT ck_audit_logs_outcome_nonempty CHECK (btrim(outcome) <> '')
);

CREATE INDEX ix_audit_logs_occurred_at ON audit_logs (occurred_at DESC);
CREATE INDEX ix_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX ix_audit_logs_actor_occurred_at ON audit_logs (actor_user_id, occurred_at DESC);

CREATE TABLE system_settings (
    key varchar(128) PRIMARY KEY,
    value jsonb NOT NULL,
    description varchar(512) NOT NULL,
    updated_by uuid NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_system_settings_key_nonempty CHECK (btrim(key) <> '')
);

CREATE INDEX ix_system_settings_updated_by ON system_settings (updated_by);

CREATE TABLE job_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type varchar(128) NOT NULL,
    business_key varchar(256) NOT NULL,
    status varchar(16) NOT NULL,
    started_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamptz,
    attempt_count integer NOT NULL DEFAULT 0,
    last_error_code varchar(128),
    CONSTRAINT uq_job_runs_type_business_key UNIQUE (job_type, business_key),
    CONSTRAINT ck_job_runs_job_type_nonempty CHECK (btrim(job_type) <> ''),
    CONSTRAINT ck_job_runs_business_key_nonempty CHECK (btrim(business_key) <> ''),
    CONSTRAINT ck_job_runs_status CHECK (status IN ('CLAIMED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED')),
    CONSTRAINT ck_job_runs_attempt_count CHECK (attempt_count >= 0),
    CONSTRAINT ck_job_runs_finish_time CHECK (finished_at IS NULL OR finished_at >= started_at)
);

INSERT INTO roles (code, description) VALUES
    ('ADMIN', 'System administration'),
    ('HOD', 'Department-scoped head of department'),
    ('FACULTY', 'Faculty member')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
    ('SYSTEM_CONFIG_READ', 'Read permitted system configuration'),
    ('SYSTEM_CONFIG_MANAGE', 'Change permitted system configuration'),
    ('FACULTY_READ', 'Read faculty information within authorized scope'),
    ('FACULTY_MANAGE', 'Manage faculty records within authorized scope'),
    ('DEPARTMENT_READ', 'Read department information within authorized scope'),
    ('DEPARTMENT_MANAGE', 'Manage department records'),
    ('DESIGNATION_READ', 'Read designation reference data'),
    ('DESIGNATION_MANAGE', 'Manage designation reference data'),
    ('CLASS_READ', 'Read class information within authorized scope'),
    ('CLASS_MANAGE', 'Manage classes'),
    ('SUBJECT_READ', 'Read subjects and offerings within authorized scope'),
    ('SUBJECT_MANAGE', 'Manage subjects and offerings'),
    ('TEACHING_ASSIGNMENT_READ', 'Read teaching assignments within authorized scope'),
    ('TEACHING_ASSIGNMENT_MANAGE', 'Manage faculty teaching assignments'),
    ('CLASS_ADVISOR_READ', 'Read advisor assignments and advisor-scoped information'),
    ('CLASS_ADVISOR_MANAGE', 'Manage class-advisor appointments'),
    ('DUTY_READ', 'Read duties and reports within authorized scope'),
    ('DUTY_SELECT', 'Self-select an eligible duty'),
    ('DUTY_ASSIGN', 'Assign a duty administratively'),
    ('DUTY_CANCEL', 'Cancel an assignment or duty where permitted'),
    ('DUTY_MANAGE', 'Manage exam-duty lifecycle and selection policy'),
    ('WORKLOAD_READ', 'Read workload policies and obligations within authorized scope'),
    ('WORKLOAD_MANAGE', 'Manage designation workload policy'),
    ('WORKLOAD_OBLIGATION_ADJUST', 'Adjust a workload obligation with audit'),
    ('PERFORMANCE_READ', 'Read student-level academic performance within authorized scope'),
    ('PERFORMANCE_AGGREGATE_READ', 'Read academic aggregates within authorized scope'),
    ('PERFORMANCE_EXPORT', 'Export authorized academic performance data'),
    ('NOTIFICATION_READ', 'Read own notifications'),
    ('NOTIFICATION_UPDATE', 'Update permitted fields on own notifications'),
    ('AUDIT_READ', 'Read audit events within authorized scope'),
    ('REPORT_READ', 'Read reports within authorized scope'),
    ('REPORT_EXPORT', 'Create or download reports within authorized scope'),
    ('ALLOCATION_RUN', 'Start or retry an authorized allocation run'),
    ('ALLOCATION_READ', 'Read allocation status and results within authorized scope'),
    ('USER_ROLE_READ', 'Read role and permission grants within authorized scope'),
    ('USER_ROLE_MANAGE', 'Manage application role and permission grants')
ON CONFLICT (code) DO NOTHING;

INSERT INTO designations (code, name) VALUES
    ('PROFESSOR', 'Professor'),
    ('ASSOCIATE_PROFESSOR', 'Associate Professor'),
    ('ASSISTANT_PROFESSOR', 'Assistant Professor')
ON CONFLICT (code) DO NOTHING;

-- Deterministic baseline date; later policy changes use their actual approved effective date.
INSERT INTO designation_workload (designation_id, required_duties, effective_from, created_by)
SELECT designation.id, policy.required_duties, DATE '2000-01-01', NULL::uuid
FROM (VALUES
    ('PROFESSOR', 1),
    ('ASSOCIATE_PROFESSOR', 2),
    ('ASSISTANT_PROFESSOR', 6)
) AS policy(designation_code, required_duties)
JOIN designations AS designation ON designation.code = policy.designation_code
WHERE NOT EXISTS (
    SELECT 1
    FROM designation_workload AS existing
    WHERE existing.designation_id = designation.id
      AND existing.effective_from = DATE '2000-01-01'
);