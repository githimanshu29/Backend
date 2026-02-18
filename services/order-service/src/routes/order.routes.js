import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/create", protect, createOrder);

export default router;