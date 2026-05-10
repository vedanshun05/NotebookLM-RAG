import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import db from "./db";
import fs from "fs";

export const getEmbeddings = () => {
  return new OpenAIEmbeddings({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    modelName: "nvidia/nv-embed-v1",
  });
};

export async function processAndIndexDocument(userId: string, filePath: string, filename: string, fileType: string) {
  let docs;
  
  try {
    if (fileType === 'pdf') {
      const loader = new PDFLoader(filePath);
      docs = await loader.load();
    } else {
      const text = fs.readFileSync(filePath, 'utf8');
      docs = [new Document({ pageContent: text, metadata: { source: filename } })];
    }

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
      collectionName: collectionName,
    });

    // Use SQLite via better-sqlite3
    const stmt = db.prepare('INSERT INTO "Document" ("userId", "filename", "fileType", "qdrantCollection") VALUES (?, ?, ?, ?)');
    stmt.run(userId, filename, fileType, collectionName);

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
    collectionName: collectionName,
  });

  const retriever = vectorStore.asRetriever({
    k: 5,
  });

  return await retriever.invoke(query);
}