import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { generateGroundedAnswer } from "@/lib/llm";

const getSql = () => neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, conversationId } = await req.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const sql = getSql();
    let currentConvId = conversationId;

    if (!currentConvId) {
      const [existingUser] = await sql`
        SELECT id FROM "User" WHERE "clerkId" = ${userId}
      `;

      let userDbId: string;
      if (!existingUser) {
        const [newUser] = await sql`
          INSERT INTO "User" ("clerkId", email)
          VALUES (${userId}, ${`${userId}@placeholder.local`})
          RETURNING id
        `;
        userDbId = newUser.id;
      } else {
        userDbId = existingUser.id;
      }

      const [conv] = await sql`
        INSERT INTO "Conversation" ("userId")
        VALUES (${userDbId})
        RETURNING id
      `;
      currentConvId = conv.id;
    }

    await sql`
      INSERT INTO "Message" ("conversationId", "role", "content")
      VALUES (${currentConvId}, 'user', ${message})
    `;

    const answer = await generateGroundedAnswer(userId, currentConvId, message);

    return NextResponse.json({ answer, conversationId: currentConvId });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
