import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createNote,getAllNotes, updateNote, getNotesByCrypto,deleteNote,associateNoteWithCrypto,getNoteById } from '../controllers/notes.controller.js'

const router = express.Router();


router.post("/createNote", verifyToken, createNote);
router.get("/getAllNotes", verifyToken, getAllNotes);
router.get("/getNote/:noteId", verifyToken, getNoteById);
router.get("/getNotesByCrypto/:cryptoId", verifyToken, getNotesByCrypto);
router.put("/updateNote/:noteId", verifyToken, updateNote);
router.delete("/deleteNote/:noteId", verifyToken, deleteNote);
router.post("/associateNote", verifyToken, associateNoteWithCrypto);



export default router;