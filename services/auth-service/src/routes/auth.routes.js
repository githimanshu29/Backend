import express from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { login , refreshAccessToken, logoutUser} from "../controllers/auth.controller.js";
import { protect } from "../middleware/protect.js";
import { getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

//protected routes
router.get("/me", protect, getMe);

export default router;