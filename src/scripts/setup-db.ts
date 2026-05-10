import db from "../lib/db";

function setupDatabase() {
  try {
    console.log("Setting up SQLite database...");

    // Drop existing tables if they exist to ensure clean state
    db.exec(`DROP TABLE IF EXISTS "Message"`);
    db.exec(`DROP TABLE IF EXISTS "Conversation"`);
    db.exec(`DROP TABLE IF EXISTS "Document"`);
    db.exec(`DROP TABLE IF EXISTS "User"`);

    // Create User table
    db.exec(`
      CREATE TABLE "User" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "clerkId" TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Document table
    db.exec(`
      CREATE TABLE "Document" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "userId" TEXT NOT NULL,
        filename TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "qdrantCollection" TEXT NOT NULL,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Conversation table
    db.exec(`
      CREATE TABLE "Conversation" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Message table
    db.exec(`
      CREATE TABLE "Message" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "conversationId" INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("SQLite database tables created successfully.");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();