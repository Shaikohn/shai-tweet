import express from "express";
import pool from "./config/database.js";

const app = express();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");

  res.json({
    connected: true,
    databaseTime: result.rows[0].now,
  });
});

export default app;