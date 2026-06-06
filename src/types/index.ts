export type Role = "student" | "faculty" | "parent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  rollNo?: string;
  phone?: string;
  childId?: string; // for parents
  avatarUrl?: string;
}

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveCategory =
  | "medical"
  | "personal"
  | "emergency"
  | "sports"
  | "hackathon"
  | "workshop"
  | "seminar";

export interface LeaveDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  verified?: boolean;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  category: LeaveCategory;
  fromDate: string;
  toDate: string;
  reason: string;
  emergency: boolean;
  status: LeaveStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  documents: LeaveDocument[];
  facultyId?: string;
  facultyName?: string;
  missedClasses?: { subject: string; date: string }[];
  assignments?: { title: string; dueDate: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "leave_submitted" | "leave_approved" | "leave_rejected" | "emergency" | "info";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
}

export interface AnalyticsSummary {
  totalLeaves: number;
  pending: number;
  approved: number;
  rejected: number;
  byMonth: { month: string; approved: number; rejected: number; pending: number }[];
  byDepartment: { department: string; count: number }[];
  byCategory: { category: string; count: number }[];
  trend: { date: string; count: number }[];
}
