import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Staff from "@/models/Staff";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const jobType = searchParams.get("jobType") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { homeAddress: { $regex: search, $options: "i" } },
      ];
    }

    if (jobType) filter.jobType = jobType;
    if (status) filter.status = status;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const staff = await Staff.find(filter).sort(sort).lean();
    const total = await Staff.countDocuments(filter);

    return NextResponse.json({ staff, total });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const { name, email, jobType } = body;

    if (!name || !email || !jobType) {
      return NextResponse.json(
        { error: "Name, email, and jobType are required" },
        { status: 400 }
      );
    }

    const existing = await Staff.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "A staff member with this email already exists" },
        { status: 409 }
      );
    }

    const staff = await Staff.create(body);
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
