
# Vectored Ground
A grounded AI assistant powered by NVIDIA NIM, Qdrant, and Next.js.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS
- **Auth**: Clerk
- **LLM/Embeddings**: NVIDIA NIM API
- **Vector DB**: Qdrant
- **Database**: PostgreSQL (via Prisma)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `NVIDIA_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`

3. Initialize database:
   ```bash
   npx prisma db push
   ```

4. Run development server:
   ```bash
   npm run dev
   ```
