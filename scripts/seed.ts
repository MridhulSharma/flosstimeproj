import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// Inline schema to avoid path alias issues in tsx
const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    jobType: { type: String, required: true, enum: ["Doctor", "Hygienist", "Assistant"] },
    availableDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: [],
    },
    homeAddress: { type: String, default: "" },
    travelRadius: { type: Number, default: 25, min: 5, max: 100 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const seedData = [
  {
    name: "Dr. Sarah Chen",
    email: "sarah.chen@flosstime.com",
    phone: "(617) 555-0101",
    jobType: "Doctor",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    homeAddress: "45 Beacon St, Boston, MA 02108",
    travelRadius: 30,
    status: "Active",
  },
  {
    name: "Marcus Williams",
    email: "marcus.w@flosstime.com",
    phone: "(617) 555-0102",
    jobType: "Hygienist",
    availableDays: ["Monday", "Wednesday", "Friday"],
    homeAddress: "12 Commonwealth Ave, Boston, MA 02116",
    travelRadius: 20,
    status: "Active",
  },
  {
    name: "Dr. James Patel",
    email: "james.patel@flosstime.com",
    phone: "(508) 555-0103",
    jobType: "Doctor",
    availableDays: ["Tuesday", "Thursday", "Friday", "Saturday"],
    homeAddress: "88 Summer St, Worcester, MA 01608",
    travelRadius: 50,
    status: "Active",
  },
  {
    name: "Emily Torres",
    email: "emily.t@flosstime.com",
    phone: "(617) 555-0104",
    jobType: "Assistant",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    homeAddress: "200 Harvard Ave, Allston, MA 02134",
    travelRadius: 15,
    status: "Active",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@flosstime.com",
    phone: "(781) 555-0105",
    jobType: "Hygienist",
    availableDays: ["Wednesday", "Thursday", "Friday", "Saturday"],
    homeAddress: "5 Central Square, Cambridge, MA 02139",
    travelRadius: 35,
    status: "Active",
  },
  {
    name: "Tom Gallagher",
    email: "tom.g@flosstime.com",
    phone: "(617) 555-0106",
    jobType: "Assistant",
    availableDays: ["Monday", "Friday"],
    homeAddress: "300 Dorchester Ave, South Boston, MA 02127",
    travelRadius: 25,
    status: "Inactive",
    notes: "On leave — available starting next quarter",
  },
];

async function seed() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("Connected to MongoDB");

    const count = await Staff.countDocuments();
    if (count > 0) {
      console.log(`Database already seeded (${count} staff members). Skipping.`);
      await mongoose.disconnect();
      return;
    }

    const inserted = await Staff.insertMany(seedData);
    console.log(`\nSeeded ${inserted.length} staff members:`);
    inserted.forEach((s: { name: string }) => console.log(`  ✓ ${s.name}`));

    await mongoose.disconnect();
    console.log("\nDone. MongoDB disconnected.");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
