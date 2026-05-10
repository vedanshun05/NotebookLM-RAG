import { neon } from "@neondatabase/serverless";

let sqlInstance: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!sqlInstance) {
    sqlInstance = neon(process.env.DATABASE_URL);
  }
  return sqlInstance;
}

export default getSql;
