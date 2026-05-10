import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { generateGroundedAnswer } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, conversationId } = await req.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    let currentConvId = conversationId;

    if (!currentConvId) {
      // Check if user exists, create if not
      const userRes = db.prepare('SELECT id FROM "User" WHERE "clerkId" = ?').get(userId);

      let userDbId: number;
      if (!userRes) {
        const newUserRes = db.prepare('INSERT INTO "User" ("clerkId", email) VALUES (?, ?) RETURNING id').get(userId, 'unknown@example.com') as any;
        userDbId = newUserRes.id;
      } else {
        userDbId = (userRes as any).id;
      }

      const convRes = db.prepare('INSERT INTO "Conversation" ("userId") VALUES (?) RETURNING id').get(userDbId) as any;
      currentConvId = convRes.id;
    }

    // Save user message
    db.prepare('INSERT INTO "Message" ("conversationId", "role", "content") VALUES (?, ?, ?)').run(currentConvId, "user", message);

    const answer = await generateGroundedAnswer(userId, currentConvId, message);

    return NextResponse.json({ answer, conversationId: currentConvId });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}