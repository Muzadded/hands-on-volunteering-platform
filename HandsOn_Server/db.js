import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env and configure it.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected idle client error", err);
});

pool
  .query("SELECT 1")
  .then(() => console.log("connected to database via pool"))
  .catch((err) => console.error("database connection error", err.stack));

export default pool;
