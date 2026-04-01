import { NextRequest, NextResponse } from "next/server";
import { getResultByKey } from "@/lib/resultStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const result = getResultByKey(key);
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
