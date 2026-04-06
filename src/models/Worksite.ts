import mongoose, { Schema, Document } from "mongoose";

export interface IWorksite extends Document {
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
  contractStart?: Date;
  contractEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorksiteSchema = new Schema<IWorksite>(
  {
    clientName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "MA", trim: true },
    zipCode: { type: String, default: "", trim: true },
    primaryContact: {
      name: { type: String, default: "" },
      title: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    contractStart: { type: Date },
    contractEnd: { type: Date },
  },
  { timestamps: true }
);

WorksiteSchema.index({ clientName: 1 });

export default mongoose.models.Worksite || mongoose.model<IWorksite>("Worksite", WorksiteSchema);
