package com.facultyportal.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4173"})
public class DemoController {

    private static final String DUTY_QUERY = """
            SELECT d.id, e.name AS exam_name,
                   CASE WHEN d.title LIKE 'Data Structures%%' THEN 'CS301'
                        WHEN d.title LIKE 'Operating Systems%%' THEN 'CS305'
                        WHEN d.title LIKE 'Computer Networks%%' THEN 'CS310'
                        ELSE 'DEMO' END AS subject_code,
                   CASE WHEN d.title LIKE 'Data Structures%%' THEN 'Data Structures'
                        WHEN d.title LIKE 'Operating Systems%%' THEN 'Operating Systems'
                        WHEN d.title LIKE 'Computer Networks%%' THEN 'Computer Networks'
                        ELSE d.title END AS subject_name,
                   d.starts_at::date AS duty_date,
                   to_char(d.starts_at AT TIME ZONE 'Asia/Kolkata', 'HH24:MI') AS start_time,
                   to_char(d.ends_at AT TIME ZONE 'Asia/Kolkata', 'HH24:MI') AS end_time,
                   d.venue, d.capacity,
                   count(a.id)::integer AS filled_seats,
                   d.status
            FROM exam_duties d
            JOIN exams e ON e.id = d.exam_id
            LEFT JOIN duty_assignments a ON a.exam_duty_id = d.id AND a.status = 'ACTIVE'
            GROUP BY d.id, e.name
            ORDER BY d.starts_at
            """;

    private final JdbcTemplate jdbc;

    public DemoController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "faculty-portal-demo", "timestamp", Instant.now().toString());
    }

    @GetMapping("/faculty")
    public Faculty faculty() {
        return jdbc.queryForObject("""
                SELECT f.id, u.display_name, f.employee_id, u.email, department.name, designation.name
                FROM faculty f
                JOIN users u ON u.id = f.user_id
                JOIN departments department ON department.id = f.department_id
                JOIN designations designation ON designation.id = f.designation_id
                WHERE f.employee_id = 'EMP-1042'
                """, (rs, rowNum) -> new Faculty(rs.getObject(1, java.util.UUID.class).toString(),
                rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6),
                "CSE 3rd Semester - Section A"));
    }

    @GetMapping("/duties")
    public List<Duty> duties() {
        return jdbc.query(DUTY_QUERY, (rs, rowNum) -> dutyFrom(rs));
    }

    @Transactional
    @PostMapping("/duties/{id}/select")
    public ResponseEntity<?> selectDuty(@PathVariable String id) {
        int inserted = jdbc.update("""
                INSERT INTO duty_assignments (exam_duty_id, faculty_id, obligation_id, assignment_type)
                SELECT d.id, '30000000-0000-0000-0000-000000000001',
                       '92000000-0000-0000-0000-000000000001', 'SELF_SELECTED'
                FROM exam_duties d
                WHERE d.id = ? AND d.status = 'OPEN'
                  AND (SELECT count(*) FROM duty_assignments a
                       WHERE a.exam_duty_id = d.id AND a.status = 'ACTIVE') < d.capacity
                ON CONFLICT (exam_duty_id, faculty_id) WHERE status = 'ACTIVE' DO NOTHING
                """, java.util.UUID.fromString(id));
        if (inserted == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This duty is no longer available or is already selected."));
        }
        return duties().stream().filter(duty -> duty.id().equals(id)).findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        Integer available = jdbc.queryForObject("SELECT count(*) FROM exam_duties WHERE status = 'OPEN'", Integer.class);
        Integer selected = jdbc.queryForObject("SELECT count(*) FROM duty_assignments WHERE status = 'ACTIVE'", Integer.class);
        return Map.of("academicYear", "2025-2026", "semester", "Odd Semester", "requiredDuties", 2,
                "availableDuties", available, "selectedOrCompleted", selected);
    }

    private Duty dutyFrom(java.sql.ResultSet rs) throws java.sql.SQLException {
        String status = switch (rs.getString("status")) {
            case "OPEN" -> "AVAILABLE";
            case "FULL" -> "CLOSED";
            default -> rs.getString("status");
        };
        return new Duty(rs.getObject("id", java.util.UUID.class).toString(), rs.getString("exam_name"),
                rs.getString("subject_code"), rs.getString("subject_name"), rs.getString("duty_date"),
                rs.getString("start_time"), rs.getString("end_time"), rs.getString("venue"),
                rs.getInt("capacity"), rs.getInt("filled_seats"), status);
    }

    public record Faculty(String id, String name, String employeeId, String email, String department,
            String designation, String advisorClass) {
    }

    public record Duty(String id, String examName, String subjectCode, String subjectName, String date,
            String startTime, String endTime, String venue, int totalSeats, int filledSeats, String status) {
    }
}
