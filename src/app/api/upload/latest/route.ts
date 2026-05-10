import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Get the most recent document from the database
    const doc = db
      .prepare('SELECT filename, "fileType", "qdrantCollection" FROM "Document" ORDER BY "createdAt" DESC LIMIT 1')
      .get();

    if (!doc) {
      return NextResponse.json({ filename: null, message: "No documents found" });
    }

    return NextResponse.json({
      filename: (doc as any).filename,
      fileType: (doc as any).fileType,
      collectionName: (doc as any).qdrantCollection,
    });
  } catch (error) {
    console.error("Error fetching latest document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}