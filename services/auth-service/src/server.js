import dotenv from "dotenv";
import app from "./app.js"; 
import { connectDB } from "./config/db.js";

dotenv.config();




connectDB();
const PORT=process.env.PORT||5001;



app.listen(PORT,()=>{
    console.log(`Auth service is running on port${PORT}`)
})