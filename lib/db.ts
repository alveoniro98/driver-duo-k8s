import { Pool } from "pg";

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum di-set");
  }
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
  });
  return pool;
}

// Tabel dibuat otomatis saat pertama kali dipakai, jadi database kosong pun langsung bisa jalan.
function ensureSchema() {
  schemaReady ??= getPool()
    .query(
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`,
    )
    .then(() => undefined)
    .catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  return schemaReady;
}

export async function query<T extends object>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function ping() {
  await getPool().query("SELECT 1");
}
