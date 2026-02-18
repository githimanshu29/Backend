import app from "./app.js";
import dotenv from "dotenv";
import connectDB from './config/db.js';

dotenv.config();

connectDB();
const PORT=process.env.PORT || 5002;

app.listen(PORT, ()=>{
    console.log(`order service running on port ${PORT}`);
})