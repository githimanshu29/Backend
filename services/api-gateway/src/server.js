import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import helmet from "helmet";
import rateLimit from "express-rate-limit";//rate limit library
import morgan from "morgan";
import logger from "./utils/logger.js";


dotenv.config();

const app = express();
//in memory fialed login tracker
const failedAttempts= new Map();

Structure:
failedAttempts = {
  "IP_ADDRESS": {
      count: Number,
      blockedUntil: Timestamp
  }
}


function blockSuspiciousIPs(req, res, next){
  const ip= req.ip;
  const record=failedAttempts.get(ip);
  if(!record) return next();

  if(record.blockedUntil &&record.blockedUntil>Date.now() ){
    return res.status(403).json({
      success:false,
      message:"Your IP is temporarily blocked due to multiple failed login attempts"
    });
  }

  next();
}

app.disable("x-powered-by");// Hides server Technology

app.use(
  helmet({
    contentSecurityPolicy:false,
    crossOriginEmbedderPolicy:false,
  })
);// Helmet security middleware



// app.use(morgan("combined"));
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

//Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,//15min
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
app.use("/api/auth/login", blockSuspiciousIPs, loginLimiter);// limits only login requests
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
  });//this is logging middleware, runs for evey middlwarwe output like-> Incoming request: POST /api/auth/login

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
       proxyTimeout: 8000, // 8 seconds
    timeout: 8000,
    onError(err, req, res) {
      console.error("Auth Service Timeout/Error:", err.message);

      res.status(504).json({
        success: false,
        message: "Auth service unavailable. Please try again."
      });
    },


    selfHandleResponse: false,
    onProxyRes(proxyRes, req, res) {
      if (req.path= "/login") {
        const ip = req.ip;

        if (proxyRes.statusCode === 401) {
          const record = failedAttempts.get(ip) || { count: 0, blockedUntil:null };

          record.count += 1;

          if (record.count >= 5) {
            record.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 min block
            console.log(`🚫 IP Blocked: ${ip}`);
          }

          failedAttempts.set(ip, record);
        }

        // If login success → reset counter
        if (proxyRes.statusCode === 200) {
          failedAttempts.delete(ip);
        }
      }
    }
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
    proxyTimeout: 8000,
    timeout: 8000,
    onError(err, req, res) {
      console.error("Order Service Timeout/Error:", err.message);

      res.status(504).json({
        success: false,
        message: "Order service unavailable. Please try again."
      });
    }
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

//error hanlder
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: "Gateway Internal Error"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});