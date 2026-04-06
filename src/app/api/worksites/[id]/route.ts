import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Worksite from "@/models/Worksite";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const worksite = await Worksite.findById(id).lean();

    if (!worksite) {
      return NextResponse.json({ error: "Worksite not found" }, { status: 404 });
    }

    return NextResponse.json(worksite);
  } catch (error) {
    console.error("GET /api/worksites/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const worksite = await Worksite.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!worksite) {
      return NextResponse.json({ error: "Worksite not found" }, { status: 404 });
    }

    return NextResponse.json(worksite);
  } catch (error) {
    console.error("PUT /api/worksites/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const worksite = await Worksite.findByIdAndDelete(id);

    if (!worksite) {
      return NextResponse.json({ error: "Worksite not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Worksite removed", id });
  } catch (error) {
    console.error("DELETE /api/worksites/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
