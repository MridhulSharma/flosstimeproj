export type JobType = "Doctor" | "Hygienist" | "Assistant";
export type AvailableDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type StaffStatus = "Active" | "Inactive";

export interface IStaff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  jobType: JobType;
  availableDays: AvailableDay[];
  homeAddress: string;
  travelRadius: number;
  status: StaffStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type StaffFormData = Omit<IStaff, "_id" | "createdAt" | "updatedAt">;

export interface DashboardStats {
  total: number;
  active: number;
  doctors: number;
  hygienists: number;
  assistants: number;
  avgRadius: number;
  totalWorksites: number;
  scheduledThisMonth: number;
}

// Worksites
export interface IWorksite {
  _id: string;
  clientName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  notes: string;
  status: "Active" | "Inactive";
  contractStart?: string;
  contractEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorksiteFormData = Omit<IWorksite, "_id" | "createdAt" | "updatedAt">;

// Assignments
export type AssignmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Cancelled";

export interface IAssignmentMember {
  staffId: string;
  name: string;
  jobType: string;
  role: string;
}

export interface IAssignment {
  _id: string;
  title: string;
  worksiteId: string;
  clientName: string;
  date: string;
  endDate?: string;
  teamSize: number;
  teamMembers: IAssignmentMember[];
  status: AssignmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type AssignmentFormData = Omit<IAssignment, "_id" | "createdAt" | "updatedAt">;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface StaffListResponse {
  staff: IStaff[];
  total: number;
}
