import express from "express";
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  forgotPassword, 
  resetPassword, 
  checkAuth,
  updateProfile,
  changePassword
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/checkauth.js";

const Router = express.Router();

// Public routes
Router.post("/register", register);
Router.post("/login", login);
Router.post("/refresh-token", refreshToken);
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password/:token", resetPassword);

// Protected routes
Router.post("/logout", verifyToken, logout);
Router.get("/check-auth", verifyToken, checkAuth);
Router.put("/update-profile", verifyToken, updateProfile);
Router.put("/change-password", verifyToken, changePassword);

export default Router;