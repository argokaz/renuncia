import { NextResponse } from "next/server";
import { getRecentScans } from "@/lib/recentStore";

export async function GET() {
  return NextResponse.json(getRecentScans());
}
