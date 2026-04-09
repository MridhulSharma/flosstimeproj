import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSuggestions } from "@/lib/ai-system-prompt";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageContext = request.nextUrl.searchParams.get("page") || undefined;
  const suggestions = getSuggestions(pageContext);

  return NextResponse.json({ suggestions });
}
