import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js";

const app=express();

app.use(express.json());
app.use(cookieParser());

app.get("/health",(req,res)=>{
    res.json({
        service:"Auth service",
        status:"Running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
console.log("Admin routes loaded");

export default app;