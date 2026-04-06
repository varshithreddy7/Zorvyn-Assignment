"use strict";

require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verify database connectivity before accepting traffic
    await prisma.$connect();
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(
        `Finance API running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown — release DB connections on SIGINT / SIGTERM
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
