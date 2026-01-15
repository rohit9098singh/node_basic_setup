import express from "express";
import dotenv from "dotenv"
import AuthRoutes from "./routes/auth.routes.js"
import UserRoutes from "./routes/user.routes.js"
import "./database/init.js"
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const PORT = process.env.APP_PORT || 4000;

app.use("/v1/api", AuthRoutes)
app.use("/v1/api", UserRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})