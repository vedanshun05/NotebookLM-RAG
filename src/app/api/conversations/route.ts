import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const conversations = db 
      .prepare('SELECT * FROM "Conversation" ORDER BY "createdAt" DESC')
      .all();

    const sessions = (conversations as any[]).map(conv => {
      const latestMessage = db
        .prepare('SELECT content FROM "Message" WHERE "conversationId" = ? ORDER BY "createdAt" DESC LIMIT 1')
        .get(conv.id);

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        lastMessage: latestMessage ? (latestMessage as any).content : "No messages yet..."
      };
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
  }

  try {
    // SQLite DELETE query to delete the conversation. Messages will be automatically
    // deleted if ON DELETE CASCADE was set up in the schema. If not, we'll delete them manually first.
    db.prepare('DELETE FROM "Conversation" WHERE id = ?').run(id);

    // Fallback cleanup in case cascade deletes aren't set up on the Message table
    db.prepare('DELETE FROM "Message" WHERE "conversationId" = ?').run(id);

    return NextResponse.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}