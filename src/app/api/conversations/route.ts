import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const getSql = () => neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = getSql();

    const [[user]] = await sql`SELECT id FROM "User" WHERE "clerkId" = ${userId}`;

    if (!user) {
      return NextResponse.json([]);
    }

    const conversations = await sql`
      SELECT c.id, c."createdAt",
        (SELECT m.content FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt" DESC LIMIT 1) as "lastMessage"
      FROM "Conversation" c
      WHERE c."userId" = ${user.id}
      ORDER BY c."createdAt" DESC
    `;

    const sessions = conversations.map((conv: any) => ({
      id: conv.id,
      createdAt: conv.createdAt,
      lastMessage: conv.lastMessage || "No messages yet...",
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
    }

    const sql = getSql();

    await sql`DELETE FROM "Message" WHERE "conversationId" = ${id}`;
    await sql`DELETE FROM "Conversation" WHERE id = ${id}`;

    return NextResponse.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
