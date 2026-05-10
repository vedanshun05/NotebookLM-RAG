import { neon } from "@neondatabase/serverless";
import { retrieveContext } from "./rag";

const getSql = () => neon(process.env.DATABASE_URL!);

export async function generateGroundedAnswer(userId: string, conversationId: string, query: string) {
  const sql = getSql();

  const [doc] = await sql`
    SELECT "qdrantCollection" FROM "Document"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC LIMIT 1
  `;

  if (!doc) {
    throw new Error("Please upload a document first.");
  }

  const collectionName = doc.qdrantCollection;
  const contextChunks = await retrieveContext(collectionName, query);
  const contextText = contextChunks.map((c: any) => c.pageContent).join("\n\n");

  const history = await sql`
    SELECT "role", "content" FROM "Message"
    WHERE "conversationId" = ${conversationId}
    ORDER BY "createdAt" ASC LIMIT 10
  `;

  const historyMessages = history.map((m: any) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const systemPrompt = `You are a grounded AI Assistant.
Use ONLY the provided context from the uploaded document to answer the user's question.
If the answer is not contained within the context, clearly state that you do not have enough information.
Do not use your general knowledge to fill in gaps.

Context:
${contextText}`;

  const openai = new (await import("openai")).OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  const response = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: query },
    ],
    temperature: 0.1,
  });

  const answer = response.choices[0].message.content || "I'm sorry, I couldn't generate an answer.";

  await sql`INSERT INTO "Message" ("conversationId", "role", "content")
             VALUES (${conversationId}, 'assistant', ${answer})`;

  return answer;
}
