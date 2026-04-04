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
}
