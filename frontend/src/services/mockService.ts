import { createStore, useStore } from "./store";
import { currentUsers, departments, classes, facultyMembers, teachingSubjects, allSubjects } from "../mock/users";
import { allStudents, classStudents, studentResults, classSubjectRoster } from "../mock/students";
import { adminDuties, allocationResults, auditLogEntries, dutyHistoryFor, workloadPolicies, allocationSummary } from "../mock/examDuties";
import { mockNotificationsV2 } from "../mock/notifications";
import type { CurrentUser, FacultyMember, AdminDuty, DutyLifecycle, AllocationResult, AuditLogEntry, WorkloadPolicy, StudentRecord, StudentSubjectResult, TeachingSubject, ClassInfo, DepartmentInfo, DutyHistoryRecord } from "../mock/types";
import type { Notification } from "../data/types";

export type Role = CurrentUser["role"];

const roleStore = createStore<Role>("FACULTY");

export function useRole(): Role {
  return useStore(roleStore);
}

export function useCurrentUser(): CurrentUser {
  const role = useStore(roleStore);
  return currentUsers[role];
}

export function setRole(role: Role) {
  roleStore.set(role);
}

const notificationsStore = createStore<Notification[]>(mockNotificationsV2);

export function useNotificationsV2(): Notification[] {
  return useStore(notificationsStore);
}

export function markNotificationReadV2(id: string) {
  notificationsStore.set(notificationsStore.get().map((item) => (item.id === id ? { ...item, read: true } : item)));
}

export function useFacultyDirectory(): FacultyMember[] {
  return facultyMembers;
}

export function useDepartments(): DepartmentInfo[] {
  return departments;
}

export function useClasses(): ClassInfo[] {
  return classes;
}

export function useSubjects(): TeachingSubject[] {
  return allSubjects;
}

const dutiesStore = createStore<AdminDuty[]>(adminDuties);

export function useAdminDuties(): AdminDuty[] {
  return useStore(dutiesStore);
}

export function setDutyStatus(dutyId: string, status: DutyLifecycle) {
  dutiesStore.set(dutiesStore.get().map((duty) => (duty.id === dutyId ? { ...duty, status } : duty)));
}

export function createDuty(duty: Omit<AdminDuty, "id" | "assigned" | "status">) {
  const current = dutiesStore.get();
  dutiesStore.set([
    { ...duty, id: `aduty-${current.length + 1}`, assigned: 0, status: "OPEN" as DutyLifecycle },
    ...current,
  ]);
}

export function assignDutyManually(dutyId: string, facultyId: string, reason: string) {
  dutiesStore.set(
    dutiesStore.get().map((duty) =>
      duty.id === dutyId ? { ...duty, assigned: Math.min(duty.assigned + 1, duty.capacity) } : duty,
    ),
  );
  const current = auditStore.get();
  auditStore.set([
    {
      id: `audit-${current.length + 1}`,
      timestamp: new Date().toISOString(),
      actor: "Suresh Iyer (ADMIN)",
      action: "DUTY_MANUALLY_ASSIGNED",
      entity: "DutyAssignment",
      entityId: `${dutyId}:${facultyId}`,
      outcome: "SUCCESS",
    },
    ...current,
  ]);
  void reason;
}

const auditStore = createStore<AuditLogEntry[]>(auditLogEntries);

export function useAuditLog(): AuditLogEntry[] {
  return useStore(auditStore);
}

export function useAllocationResults(): AllocationResult[] {
  return allocationResults;
}

export function useAllocationSummary() {
  return allocationSummary();
}

const workloadStore = createStore<WorkloadPolicy[]>(workloadPolicies);

export function useWorkloadPolicies(): WorkloadPolicy[] {
  return useStore(workloadStore);
}

export function updateWorkloadPolicy(id: string, requiredDuties: number) {
  workloadStore.set(workloadStore.get().map((policy) => (policy.id === id ? { ...policy, requiredDuties } : policy)));
}

export function useDutyHistory(facultyId: string): DutyHistoryRecord[] {
  return dutyHistoryFor(facultyId);
}

export function useStudentsForClass(classId: string): StudentRecord[] {
  return classStudents(classId);
}

export function useAllStudents(): StudentRecord[] {
  return allStudents;
}

export function useStudentResults(student: StudentRecord, subjects: { code: string; name: string; facultyName: string }[]): StudentSubjectResult[] {
  return studentResults(student, subjects);
}

export function useClassSubjectRoster(classId: string) {
  return classSubjectRoster(classId);
}

export function useFacultyTeachingSubjects(facultyId: string): TeachingSubject[] {
  return teachingSubjects.filter((subject) => subject.facultyId === facultyId);
}
