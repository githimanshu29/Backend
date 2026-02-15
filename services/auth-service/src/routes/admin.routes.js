import express from "express";
import { protect } from "../middleware/protect.js";
import { authorize } from "../middleware/authorize.js";
const router=express.Router();

router.get("/dashboard",protect,authorize("admin"),(req, res)=>{
  
    res.status(200).json({
        success:true,
        message:"welcome Admin",
        user:req.user,
    });
});

export default router;