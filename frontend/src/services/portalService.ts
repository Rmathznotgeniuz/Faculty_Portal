import { createStore, useStore } from "./store";
import { mockAssignments, mockDuties, mockFaculty, academicTerm } from "../data/mockFaculty";
import { mockNotifications } from "../data/mockNotifications";
import { mockPerformance, mockAdvisorSummary } from "../data/mockPerformance";
import { mockSubjects } from "../data/mockSubjects";
import { authenticatedFetch } from "../auth/keycloak";
import type {
  ClassAdvisorSummary,
  DutyAssignment,
  DutyStatus,
  ExamDuty,
  Faculty,
  Notification,
  PerformanceSummary,
  Subject,
} from "../data/types";

const dutiesStore = createStore<ExamDuty[]>([...mockDuties]);
const assignmentsStore = createStore<DutyAssignment[]>([...mockAssignments]);
const notificationsStore = createStore<Notification[]>([...mockNotifications]);

export const facultyService = {
  getFaculty(): Faculty {
    return mockFaculty;
  },
  getAcademicTerm() {
    return academicTerm;
  },
  getSubjects(): Subject[] {
    return mockSubjects;
  },
  getPerformance(): PerformanceSummary[] {
    return mockPerformance;
  },
  getAdvisorSummary(): ClassAdvisorSummary | null {
    return mockFaculty.isClassAdvisor ? mockAdvisorSummary : null;
  },
};

export const dutyService = {
  useDuties() {
    return useStore(dutiesStore);
  },
  useAssignments() {
    return useStore(assignmentsStore);
  },
  async selectDuty(dutyId: string): Promise<DutyAssignment> {
    const duties = dutiesStore.get();
    const duty = duties.find((item) => item.id === dutyId);
    if (!duty) {
      throw new Error("Duty not found");
    }
    const response = await authenticatedFetch(`/api/demo/duties/${dutyId}/select`, { method: "POST" });
    if (!response.ok) {
      throw new Error("This duty is no longer available");
    }
    const assignment: DutyAssignment = {
      id: `asg-${Date.now()}`,
      dutyId: duty.id,
      examName: duty.examName,
      subjectCode: duty.subjectCode,
      subjectName: duty.subjectName,
      date: duty.date,
      startTime: duty.startTime,
      endTime: duty.endTime,
      venue: duty.venue,
      assignmentType: "SELF_SELECTED",
      status: "SELECTED",
    };
    assignmentsStore.set([...assignmentsStore.get(), assignment]);
    dutiesStore.set(
      duties.map((item) => (item.id === dutyId ? { ...item, status: "SELECTED" as DutyStatus } : item)),
    );
    return assignment;
  },
};

export const notificationService = {
  useNotifications() {
    return useStore(notificationsStore);
  },
  markAsRead(id: string) {
    notificationsStore.set(
      notificationsStore.get().map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  },
};
