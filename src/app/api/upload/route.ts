import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processAndIndexDocument } from "@/lib/rag";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPath = path.join(os.tmpdir(), file.name);
    writeFileSync(tempPath, buffer);

    const fileType = file.name.endsWith(".pdf") ? "pdf" : "txt";
    
    const { collectionName } = await processAndIndexDocument(
      userId, 
      tempPath, 
      file.name, 
      fileType
    );

    unlinkSync(tempPath);

    return NextResponse.json({ message: "Indexed successfully", collectionName });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}