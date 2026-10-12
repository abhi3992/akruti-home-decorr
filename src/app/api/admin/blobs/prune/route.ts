import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { pruneUnusedBlobs } from "@/lib/blob-cleanup";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pruneUnusedBlobs();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not remove unused files";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
