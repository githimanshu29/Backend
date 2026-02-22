import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

/*
=========================================
AUTH SERVICE PROXY
=========================================
*/

app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
  });

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
  })
);

/*
=========================================
ORDER SERVICE PROXY
=========================================
*/

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
  })
);

/*
=========================================
HEALTH CHECK
=========================================
*/

app.get("/health", (req, res) => {
  res.json({
    service: "API Gateway",
    status: "Running ✅",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});