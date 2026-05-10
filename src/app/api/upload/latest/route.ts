import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const getSql = () => neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = getSql();

    const [[doc]] = await sql`
      SELECT filename, "fileType", "qdrantCollection"
      FROM "Document"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    if (!doc) {
      return NextResponse.json({ filename: null, message: "No documents found" });
    }

    return NextResponse.json({
      filename: doc.filename,
      fileType: doc.fileType,
      collectionName: doc.qdrantCollection,
    });
  } catch (error) {
    console.error("Error fetching latest document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}
