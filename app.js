"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const recordRoutes = require("./src/routes/record.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");

const { sendError } = require("./src/utils/response");

//  App Setup 

const app = express();

// Global Middleware 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — 100 requests per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use(limiter);

// Health Check 

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Finance API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API Routes 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// 404 Handler 

app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// Global Error Handler 
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Error]", err);

  // Prisma known request errors
  if (err.code === "P2002") {
    return sendError(res, "A record with that value already exists.", 409);
  }
  if (err.code === "P2025") {
    return sendError(res, "Record not found.", 404);
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  return sendError(res, message, status);
});

module.exports = app;
