import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((res) => {
    console.log("Database connected successfully")
}).catch((err) => {
    console.log("Database connection failed")
})