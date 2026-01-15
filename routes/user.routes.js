import express from "express";
import { profile } from "../controllers/user.controller.js"
import { checkAuth } from "../middleware/checkauth.js";

const Router = express.Router();

Router.get("/profile", checkAuth, profile)

export default Router;