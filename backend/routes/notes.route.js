import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createNote,getAllNotes, updateNote, deleteNote,associateNoteWithCrypto } from '../controllers/notes.controller.js'

const router = express.Router();


router.post("/createNote", verifyToken, createNote);
router.get("/getAllNotes", verifyToken, getAllNotes);
router.put("/updateNote/:noteId", verifyToken, updateNote);
router.delete("/deleteNote/:noteId", verifyToken, deleteNote);
router.put("/associateNote", verifyToken, associateNoteWithCrypto);


export default router;