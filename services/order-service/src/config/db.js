import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB connected successfully - ORDER SERVICE");
        
    } catch (error) {
        console.log("❌ MongoDB Connection Failed (Order Service)");
        console.log(error.message);
        process.exit(1);
    }
};

export default connectDB;