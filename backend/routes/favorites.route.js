import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addToFavorites,getAllFavorites,removeFromFavorites,getFavoritesSelected,getFavoritesWithData } from "../controllers/favorites.controller.js";

const router = express.Router();

router.post("/favorites/add", verifyToken, addToFavorites);
router.get("/favorites", verifyToken, getAllFavorites)
router.delete("/favorites/remove", verifyToken, removeFromFavorites);
router.get("/favorites/selected", verifyToken, getFavoritesSelected);
router.get("/favorites/withData", verifyToken, getFavoritesWithData);

export default router;