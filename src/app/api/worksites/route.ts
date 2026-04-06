import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Worksite from "@/models/Worksite";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "clientName";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const worksites = await Worksite.find(filter).sort(sort).lean();
    const total = worksites.length;

    return NextResponse.json({ worksites, total });
  } catch (error) {
    console.error("GET /api/worksites error:", error);
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
    const { clientName, address, city } = body;

    if (!clientName || !address || !city) {
      return NextResponse.json(
        { error: "Client name, address, and city are required" },
        { status: 400 }
      );
    }

    const existing = await Worksite.findOne({
      clientName: { $regex: `^${clientName.trim()}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A worksite with this client name already exists" },
        { status: 409 }
      );
    }

    const worksite = await Worksite.create(body);
    return NextResponse.json(worksite, { status: 201 });
  } catch (error) {
    console.error("POST /api/worksites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
