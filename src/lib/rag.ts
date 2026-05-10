import { neon } from "@neondatabase/serverless";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import pdfParse from "pdf-parse";

const getSql = () => neon(process.env.DATABASE_URL!);

export const getEmbeddings = () => {
  return new OpenAIEmbeddings({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    modelName: "nvidia/nv-embed-v1",
  });
};

export async function processAndIndexDocument(
  userId: string,
  buffer: Buffer,
  filename: string,
  fileType: string
) {
  try {
    let text: string;

    if (fileType === "pdf") {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      text = buffer.toString("utf8");
    }

    const docs = [new Document({ pageContent: text, metadata: { source: filename } })];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    const embeddings = getEmbeddings();
    const collectionName = `docs_${userId}_${Date.now()}`;

    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName,
    });

    const sql = getSql();
    await sql`INSERT INTO "Document" ("userId", "filename", "fileType", "qdrantCollection")
             VALUES (${userId}, ${filename}, ${fileType}, ${collectionName})`;

    return { collectionName };
  } catch (error) {
    console.error("RAG Process Error:", error);
    throw error;
  }
}

export async function retrieveContext(collectionName: string, query: string) {
  const embeddings = getEmbeddings();
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName,
  });

  const retriever = vectorStore.asRetriever({ k: 5 });
  return await retriever.invoke(query);
}
