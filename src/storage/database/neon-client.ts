import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(DATABASE_URL);

export interface UserRow {
  id: number;
  username: string;
  password: string;
  created_at: Date;
}

export interface GeneratedImageRow {
  id: number;
  user_id: number | null;
  image_url: string;
  prompt: string;
  character_id: string | null;
  created_at: Date;
}

let generatedImagesTableInitialized = false;

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const result = await sql`
    SELECT id, username, password, created_at 
    FROM users 
    WHERE username = ${username}
  `;
  return result.length > 0 ? result[0] as UserRow : null;
}

export async function createUser(username: string, password: string): Promise<UserRow> {
  const result = await sql`
    INSERT INTO users (username, password)
    VALUES (${username}, ${password})
    RETURNING id, username, password, created_at
  `;
  return result[0] as UserRow;
}

export async function userExists(username: string): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS(SELECT 1 FROM users WHERE username = ${username}) as exists
  `;
  return result[0].exists;
}

async function ensureGeneratedImagesTable(): Promise<void> {
  if (generatedImagesTableInitialized) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS generated_images (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      image_url TEXT NOT NULL,
      prompt TEXT NOT NULL,
      character_id VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON generated_images(user_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON generated_images(created_at)
  `;

  generatedImagesTableInitialized = true;
}

export async function createGeneratedImage(params: {
  userId?: number | null;
  imageUrl: string;
  prompt: string;
  characterId?: string | null;
}): Promise<GeneratedImageRow> {
  await ensureGeneratedImagesTable();

  const result = await sql`
    INSERT INTO generated_images (user_id, image_url, prompt, character_id)
    VALUES (${params.userId ?? null}, ${params.imageUrl}, ${params.prompt}, ${params.characterId ?? null})
    RETURNING id, user_id, image_url, prompt, character_id, created_at
  `;

  return result[0] as GeneratedImageRow;
}

export async function initializeDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  
  await sql`
    CREATE INDEX IF NOT EXISTS users_username_idx ON users(username)
  `;

  await ensureGeneratedImagesTable();
}
