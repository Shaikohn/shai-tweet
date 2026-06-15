import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Database connected successfully");
    });
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);
    process.exit(1);
  }
}

startServer();