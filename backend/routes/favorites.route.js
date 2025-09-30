import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addToFavorites,getFavoriteIds,removeFromFavorites,getFavoriteDetails} from "../controllers/favorites.controller.js";

const router = express.Router();

router.post("/favorites/add", verifyToken, addToFavorites);
router.delete("/favorites/remove", verifyToken, removeFromFavorites);
router.get("/favorites", verifyToken, getFavoriteIds);
router.get("/favorites/details", verifyToken, getFavoriteDetails);


export default router;