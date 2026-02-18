import express from "express";
import { protect } from "../middleware/protect.js";
import { authorize } from "../middleware/authorize.js";
const router=express.Router();


///router.get("/content", protect, authorize("admin", "editor"));
router.get("/dashboard",protect,authorize("admin"),(req, res)=>{
  
    res.status(200).json({
        success:true,
        message:"welcome Admin",
        user:req.user,
    });
});

export default router;


// ✅ Authentication vs Authorization

// This is the key difference:

// Authentication = Who are you?

// Login proves:

// This is Himanshu

// Done using:

// email/password

// access token

// Authorization = What are you allowed to do?

// RBAC proves:

// Himanshu is only a customer, not admin

// So he cannot access admin routes.