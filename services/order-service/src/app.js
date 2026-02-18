import express from "express";
import orderRoutes from "./routes/order.routes.js";

const app=express();

app.use(express.json());



app.get("/health", (req, res)=>{
    res.json({
        service:"order service",
        status:"Running",
    });
});

app.use("/api/orders",orderRoutes);



export default app;