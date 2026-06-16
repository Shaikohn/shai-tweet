import pg from "pg";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

export async function testDatabaseConnection() {
  const result = await pool.query("SELECT NOW() AS now");
  return result.rows[0];
}

export default pool;