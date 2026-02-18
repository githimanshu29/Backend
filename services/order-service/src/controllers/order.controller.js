import Order from "../models/order.js";

export const createOrder = async(req, res)=>{
    try {
        const {items}=req.body;
        
        let totalAmount = 0;
        items.forEach((item)=>{
            totalAmount+=item.price*item.quantity;
        })

        const order = await Order.create({
            userId: req.userId,// from protect middleware
            items,
            totalAmount,

        });

        res.status(201).json({
            success:true,
            message:"Order Created SucessFully."
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message: "Order not created successfully.",
            error:error.message,
        })
    }
}