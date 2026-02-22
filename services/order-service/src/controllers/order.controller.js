import Order from "../models/order.js";

export const createOrder = async(req, res)=>{
    try {
        const {items}=req.body;
        
        let totalAmount = 0;
        items.forEach((item)=>{
            totalAmount+=item.price*item.quantity;
        })

        const order = await Order.create({
            userId: req.user.userId,// from protect middleware
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

export const getMyOrders= async(req, res)=>{
    try {

        const orders = await Order.find({userId:req.user.userId}).sort({createdAt:-1,});

        return res.status(200).json({
            success:true,
            message:"My orders fetched successfully ",
            count:orders.length,
            orders,
        });
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Failed to get the orders',
            error: error.message,
        });
    }
}


export const getAllOrders =async(req,res)=>{
    try {
        if(req.user.role!=="admin"){
            return res.status(403).json({
                success:false,
                message:"Access denied, only admin can acesss",
            });
        }

        const orders = await Order.find().sort({createdAt:-1});
        return res.status(200).json({
            success:true,
            message:"All orders fetched successfully",
            count:orders.length,
            orders,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to fetch all users",
            error: error.message,
        })
    }
}

export const updateOrderStatus = async(req, res)=>{
  try {
    const {id}=req.params;
    const {status}=req.body;

    if(req.user.role!=="admin" && req.user.role!=="delivery"){
        return res.status(403).json({
            success:false,
            message:"Acess Denied. Adminf or Delivery only",
        });
    }  

        const order = await Order.findById(id);

        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order Not Found"
            });
        }

        order.status=status;
        await order.save();

        return res.status(200).json({
            success:true,
            message:"Order status Found successsfully",
            order,
        })
    }
   catch (error) {
     return res.status(500).json({
        success:false,
        message:"Failed to update order",
        error:error.message,
     })
  }
}


export const cancelOrder = async (req, res) => {
    try {
      const { id } = req.params;
  
      const order = await Order.findById(id);
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
  
      // Only the owner can cancel
      if (order.userId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel your own orders",
        });
      }
  
      // Only if status is pending
      if (order.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Order cannot be cancelled after confirmation",
        });
      }
  
      order.status = "cancelled";
      await order.save();
  
      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  };