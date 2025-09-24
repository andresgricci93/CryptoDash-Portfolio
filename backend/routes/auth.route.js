import express from "express";
import {login,
    signup, 
    logout,
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    checkAuth,    
    deleteAccount,
    changePassword,
    verifyCurrentPassword
} from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// middleware to verify if user is authenticated or not
router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-current-password", verifyToken, verifyCurrentPassword);
router.put("/change-password", verifyToken, changePassword);
router.delete("/delete-account",verifyToken, deleteAccount);

export default router;