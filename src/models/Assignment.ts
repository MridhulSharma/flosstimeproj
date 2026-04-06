import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentMember {
  staffId: mongoose.Types.ObjectId;
  name: string;
  jobType: string;
  role: string;
}

export interface IAssignment extends Document {
  title: string;
  worksiteId: mongoose.Types.ObjectId;
  clientName: string;
  date: Date;
  endDate?: Date;
  teamSize: number;
  teamMembers: IAssignmentMember[];
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentMemberSchema = new Schema(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    name: { type: String, required: true },
    jobType: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    worksiteId: { type: Schema.Types.ObjectId, ref: "Worksite", required: true },
    clientName: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    teamSize: { type: Number, required: true, min: 1, max: 20 },
    teamMembers: { type: [AssignmentMemberSchema], default: [] },
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

AssignmentSchema.index({ date: 1 });
AssignmentSchema.index({ worksiteId: 1 });

export default mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);
