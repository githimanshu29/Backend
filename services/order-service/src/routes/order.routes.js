import express from "express";
import { cancelOrder, createOrder, updateOrderStatus } from "../controllers/order.controller.js";
import { protect } from "../middleware/protect.js";
import { getMyOrders, getAllOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.get("/myOrders", protect,getMyOrders);
router.get("/allOrders",protect, getAllOrders);
router.patch("/:id/status", protect, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);

export default router;