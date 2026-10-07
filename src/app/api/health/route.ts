import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!db) {
      return Response.json({ ok: true, mode: "mock" });
    }
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "database" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
