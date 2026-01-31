import express from "express";
import { profile, updateProfile } from "../controllers/user.controller.js"
import { checkAuth } from "../middleware/checkauth.js";

const Router = express.Router();

Router.get("/profile", checkAuth, profile)
Router.post("/update",updateProfile)

export default Router;