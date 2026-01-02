require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const organizationRoutes = require("./routes/organizations");
const transactionRoutes = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   CORS CONFIGURATION
======================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://org-expense-tracker.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from tools like Postman or server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle preflight requests
app.options("*", cors());

/* =======================
   MIDDLEWARE
======================= */

app.use(express.json());

/* =======================
   ROUTES
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/transactions", transactionRoutes);

/* =======================
   HEALTH CHECK
======================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =======================
   SERVER START
======================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
