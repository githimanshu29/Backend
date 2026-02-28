import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";


dotenv.config();

const app = express();
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy:false,
    crossOriginEmbedderPolicy:false,
  })
);



app.use(morgan("combined"));

//Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

//Register Limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many accounts created from this IP."
  }
});

//general API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  }
});


//  Apply rate limiters
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api", apiLimiter);

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


app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);

  res.status(500).json({
    success: false,
    message: "Gateway Internal Error"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});