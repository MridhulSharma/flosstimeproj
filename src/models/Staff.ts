import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  jobType: "Doctor" | "Hygienist" | "Assistant";
  availableDays: Array<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">;
  homeAddress: string;
  travelRadius: number;
  status: "Active" | "Inactive";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    jobType: {
      type: String,
      required: true,
      enum: ["Doctor", "Hygienist", "Assistant"],
    },
    availableDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: [],
    },
    homeAddress: { type: String, default: "" },
    travelRadius: { type: Number, default: 25, min: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

StaffSchema.index({ email: 1 });

export default mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
