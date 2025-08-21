import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addToFavorites,getAllFavorites,removeFromFavorites } from "../controllers/favorites.controller.js";

const router = express.Router();

router.post("/favorites/add", verifyToken, addToFavorites);
router.get("/favorites", verifyToken, getAllFavorites)
router.delete("/favorites/remove", verifyToken, removeFromFavorites);


export default router;