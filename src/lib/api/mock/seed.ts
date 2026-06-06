import type { User, LeaveRequest, Notification, Department } from "@/types";

export const DEMO_PASSWORD = "demo1234";

export const seedUsers: (User & { password: string })[] = [
  { id: "u-student", name: "Arun Kumar", email: "student@demo.com", role: "student", department: "CSE", rollNo: "21CS045", phone: "+91 90000 00001", password: DEMO_PASSWORD },
  { id: "u-faculty", name: "Dr. Priya Raman", email: "faculty@demo.com", role: "faculty", department: "CSE", phone: "+91 90000 00002", password: DEMO_PASSWORD },
  { id: "u-parent", name: "Suresh Kumar", email: "parent@demo.com", role: "parent", phone: "+91 90000 00003", childId: "u-student", password: DEMO_PASSWORD },
  { id: "u-admin", name: "Admin User", email: "admin@demo.com", role: "admin", phone: "+91 90000 00004", password: DEMO_PASSWORD },
];

export const seedDepartments: Department[] = [
  { id: "d-cse", name: "Computer Science & Engineering", code: "CSE", hod: "Dr. Priya Raman" },
  { id: "d-ece", name: "Electronics & Communication", code: "ECE", hod: "Dr. Mohan Das" },
  { id: "d-mech", name: "Mechanical Engineering", code: "MECH", hod: "Dr. Lakshmi" },
  { id: "d-it", name: "Information Technology", code: "IT", hod: "Dr. Karthik" },
];

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };
const daysAhead = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

export const seedLeaves: LeaveRequest[] = [
  {
    id: "l-1", studentId: "u-student", studentName: "Arun Kumar", department: "CSE",
    category: "medical", fromDate: daysAgo(10), toDate: daysAgo(8),
    reason: "Viral fever and doctor advised rest for 3 days.", emergency: false,
    status: "approved", remarks: "Approved. Get well soon.",
    createdAt: daysAgo(11), updatedAt: daysAgo(10),
    facultyId: "u-faculty", facultyName: "Dr. Priya Raman",
    documents: [{ id: "doc-1", name: "medical_certificate.pdf", size: 245000, type: "application/pdf", verified: true }],
    missedClasses: [{ subject: "Data Structures", date: daysAgo(10) }, { subject: "DBMS", date: daysAgo(9) }],
    assignments: [{ title: "DBMS Assignment 3", dueDate: daysAhead(2) }],
  },
  {
    id: "l-2", studentId: "u-student", studentName: "Arun Kumar", department: "CSE",
    category: "hackathon", fromDate: daysAhead(3), toDate: daysAhead(5),
    reason: "Selected for Smart India Hackathon finals at IIT Madras.", emergency: false,
    status: "pending", createdAt: daysAgo(1), updatedAt: daysAgo(1),
    documents: [{ id: "doc-2", name: "sih_selection.pdf", size: 180000, type: "application/pdf" }],
  },
  {
    id: "l-3", studentId: "u-stu2", studentName: "Meera S", department: "CSE",
    category: "personal", fromDate: daysAhead(1), toDate: daysAhead(1),
    reason: "Family function.", emergency: false,
    status: "pending", createdAt: daysAgo(2), updatedAt: daysAgo(2), documents: [],
  },
  {
    id: "l-4", studentId: "u-stu3", studentName: "Vignesh R", department: "ECE",
    category: "sports", fromDate: daysAhead(7), toDate: daysAhead(10),
    reason: "State-level cricket tournament representing the college.", emergency: false,
    status: "pending", createdAt: daysAgo(3), updatedAt: daysAgo(3), documents: [],
  },
  {
    id: "l-5", studentId: "u-student", studentName: "Arun Kumar", department: "CSE",
    category: "emergency", fromDate: daysAgo(30), toDate: daysAgo(28),
    reason: "Family emergency.", emergency: true,
    status: "approved", remarks: "Approved on emergency grounds.",
    createdAt: daysAgo(30), updatedAt: daysAgo(30),
    facultyId: "u-faculty", facultyName: "Dr. Priya Raman", documents: [],
  },
  {
    id: "l-6", studentId: "u-stu4", studentName: "Divya L", department: "IT",
    category: "workshop", fromDate: daysAgo(20), toDate: daysAgo(19),
    reason: "AI/ML workshop at Anna University.", emergency: false,
    status: "rejected", remarks: "Insufficient prior notice.",
    createdAt: daysAgo(22), updatedAt: daysAgo(20),
    facultyId: "u-faculty", facultyName: "Dr. Priya Raman", documents: [],
  },
];

export const seedNotifications: Notification[] = [
  { id: "n-1", userId: "u-student", title: "Leave approved", body: "Your medical leave was approved.", type: "leave_approved", read: false, createdAt: daysAgo(10), link: "/leaves/l-1" },
  { id: "n-2", userId: "u-faculty", title: "New leave request", body: "Meera S submitted a personal leave.", type: "leave_submitted", read: false, createdAt: daysAgo(2), link: "/faculty/requests" },
  { id: "n-3", userId: "u-faculty", title: "Hackathon leave request", body: "Arun Kumar requested 3 days for SIH finals.", type: "leave_submitted", read: false, createdAt: daysAgo(1), link: "/faculty/requests" },
  { id: "n-4", userId: "u-parent", title: "Leave submitted", body: "Arun submitted a hackathon leave request.", type: "leave_submitted", read: true, createdAt: daysAgo(1) },
];
