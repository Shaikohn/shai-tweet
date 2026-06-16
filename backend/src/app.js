import express from "express";
import pool from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import tweetRoutes from "./modules/tweets/tweet.routes.js";

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);

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