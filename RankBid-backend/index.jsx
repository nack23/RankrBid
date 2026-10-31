const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const allRoutes = require("./routes/allRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

const allowedOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  throw new Error("FRONTEND_ORIGINS must be configured in production");
}
app.use(cors({
  origin(origin, callback) {
    // Razorpay webhooks and other server requests do not send a browser Origin.
    if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed"));
  },
}));
// Razorpay signs the exact request bytes. Parse this path before express.json().
app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "64kb" }));
app.use(express.json());

// ========================================
// HOME / HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "RankBid Backend is running!",
  });
});

// ========================================
// DATABASE TEST
// ========================================

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      message:
        "Database connected successfully!",

      time:
        result.rows[0].now,
    });
  } catch (error) {
    console.error(`Database health check failed (code: ${error.code || "UNKNOWN"}).`);

    res.status(500).json({
      message:
        "Database connection failed",
    });
  }
});

// ========================================
// ALL API ROUTES
// ========================================

app.use(allRoutes);
app.use(paymentRoutes);

// ========================================
// START SERVER
// ========================================

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  if (!process.env.DATABASE_URL) {
    console.error("Database startup check failed: DATABASE_URL is missing.");
    process.exitCode = 1;
    return;
  }

  console.log("Checking database connection...");
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Keep credentials and the connection string out of deployment logs.
    console.error(`Database startup check failed (code: ${error.code || "UNKNOWN"}).`);
    process.exitCode = 1;
    await pool.end();
  }
}

startServer();
