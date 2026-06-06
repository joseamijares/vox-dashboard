import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sql } = body;

    if (!sql) {
      return NextResponse.json({ error: "Missing SQL" }, { status: 400 });
    }

    // Only allow CREATE TABLE, CREATE INDEX, ALTER, INSERT, UPDATE, DELETE
    // Block DROP, TRUNCATE, GRANT, REVOKE for safety
    const lower = sql.toLowerCase().trim();
    const blocked = ["drop", "truncate", "grant", "revoke", "--", ";"];
    for (const b of blocked) {
      if (lower.includes(b)) {
        return NextResponse.json({ error: `Blocked keyword: ${b}` }, { status: 403 });
      }
    }

    const result = await query(sql);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("SQL error:", error);
    return NextResponse.json(
      { error: "SQL execution failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
