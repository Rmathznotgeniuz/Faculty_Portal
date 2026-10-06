import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import AssignmentsPage from "../pages/AssignmentsPage";
import ClassAdvisorPage from "../pages/ClassAdvisorPage";
import DashboardPage from "../pages/DashboardPage";
import ExamDutiesPage from "../pages/ExamDutiesPage";
import HomePage from "../pages/HomePage";
import NotificationsPage from "../pages/NotificationsPage";
import PerformancePage from "../pages/PerformancePage";
import SubjectsPage from "../pages/SubjectsPage";
import NotFoundPage from "../pages/NotFoundPage";
import StudentsPage from "../pages/StudentsPage";
import DutyHistoryPage from "../pages/DutyHistoryPage";
import HodDashboardPage from "../pages/hod/HodDashboardPage";
import HodFacultyPage from "../pages/hod/HodFacultyPage";
import HodClassesPage from "../pages/hod/HodClassesPage";
import HodExamDutiesPage from "../pages/hod/HodExamDutiesPage";
import HodPerformancePage from "../pages/hod/HodPerformancePage";
import HodReportsPage from "../pages/hod/HodReportsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminFacultyPage from "../pages/admin/AdminFacultyPage";
import AdminDepartmentsPage from "../pages/admin/AdminDepartmentsPage";
import AdminClassesPage from "../pages/admin/AdminClassesPage";
import AdminSubjectsPage from "../pages/admin/AdminSubjectsPage";
import AdminExamDutiesPage from "../pages/admin/AdminExamDutiesPage";
import AdminAllocationsPage from "../pages/admin/AdminAllocationsPage";
import AdminWorkloadPage from "../pages/admin/AdminWorkloadPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminAuditPage from "../pages/admin/AdminAuditPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exam-duties" element={<ExamDutiesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/class-advisor" element={<ClassAdvisorPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/duty-history" element={<DutyHistoryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/hod" element={<HodDashboardPage />} />
          <Route path="/hod/faculty" element={<HodFacultyPage />} />
          <Route path="/hod/classes" element={<HodClassesPage />} />
          <Route path="/hod/exam-duties" element={<HodExamDutiesPage />} />
          <Route path="/hod/performance" element={<HodPerformancePage />} />
          <Route path="/hod/reports" element={<HodReportsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/faculty" element={<AdminFacultyPage />} />
          <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
          <Route path="/admin/classes" element={<AdminClassesPage />} />
          <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
          <Route path="/admin/exam-duties" element={<AdminExamDutiesPage />} />
          <Route path="/admin/allocations" element={<AdminAllocationsPage />} />
          <Route path="/admin/workload" element={<AdminWorkloadPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
