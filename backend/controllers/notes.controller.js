import { Note } from "../models/note.model.js";
import logger from '../utils/logger.js';
import { generateEmbedding } from "../services/embedding.service.js";
import { addNote as addNoteToChroma } from "../services/chromadb.service.js";
import {updateNote as updateNoteInChroma} from "../services/chromadb.service.js"
import {deleteNote as deleteNoteForChroma} from '../services/chromadb.service.js'


export const createNote = async (req,res) => {

 const {title, htmlContent,textContent, tags} = req.body;
 const userId = req.userId;


 try {

    const note = new Note({
        title,
        htmlContent,
        textContent,
        tags: tags || [],
        cryptoId: [],
        userId
    });

    await note.save();
      // vectorize and save to ChromaDB (async, non blocking)
    try {

      // The same textContent that we are retrieving from the request body and 
      // that we are saving as a note in mongodb we will use again for generating the embedding
      
      const embedding = await generateEmbedding(textContent);
      await addNoteToChroma(
        note._id.toString(),
        embedding,
        {
          userId: userId.toString(),
          title: title,
          tags: (tags || []).join(',')
        }
      );
      logger.info('Note vectorized successfully', { 
        noteId: note._id.toString(), 
        title: title,
        userId: userId.toString()
      });
    } catch (embeddingError) {
      logger.error('Failed to vectorize note', {
        noteId: note._id.toString(),
        title: title,
        userId: userId.toString(),
        error: embeddingError.message,
        stack: embeddingError.stack
      });
    } 
    res.status(201).json({
        success: true,
        message: "Note created successfully",
        note
    });

 } catch (error) {

    res.status(400).json({
        success: false,
        message: error.message
    });
 }

};


export const getAllNotes = async (req,res) => {

    try {

      const notes = await Note.find({userId: req.userId}).sort({createdAt: -1})
      res.status(200).json({
        success: true,
        notes
      });

    } catch (error) {
     res.status(500).json({
        success: false,
        message: error.message
     });
    }

};
export const getNoteById = async (req,res) => {
  const { noteId } = req.params;
  const userId = req.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      note
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
export const updateNote = async (req,res) => {

 const {noteId} = req.params;
 const {title, htmlContent, textContent, tags} = req.body;


 const userId = req.userId;

 try {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: userId },
    { title, htmlContent, textContent, tags },
    { new:true }
  );

  if (!note) {
   return res.status(404).json({
    success: false,
    message: "Note not found or unauthorized"
   });
  }
    
  // Re-vectorize and update in ChromaDB
  try {
      const embedding = await generateEmbedding(textContent);
      
      await updateNoteInChroma(
        noteId,  
        embedding,
        {
          userId: userId.toString(),
          title: title,
          tags: (tags || []).join(',')
        }
      );
      logger.info('Note re-vectorized successfully', {
        noteId,
        title,
        userId: userId.toString()
      });
    } catch (embeddingError) {
      logger.error('Failed to re-vectorize note', {
        noteId,
        title,
        userId: userId.toString(),
        error: embeddingError.message,
        stack: embeddingError.stack
      });
    }

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    note
  })
 } catch (error) {
  res.status(400).json({
      success: false,
      message: error.message,
    })
 }
}

export const associateNoteWithCrypto = async (req,res) => {
   const  { noteId, cryptoId } = req.body;
   const userId = req.userId;
try {


   const note = await Note.findOne({_id:noteId, userId});

   if (!note) {
    return res.status(404).json({
       success: false,
       message: "Note not found"
    })
   }

   if (!note.cryptoId) {
    note.cryptoId = [];
   }
   if (note.cryptoId.includes(cryptoId)) {
    return res.status(400).json({
       success: false,
       message: "Note is already associated with this crypto"
    });
   }

   note.cryptoId.push(cryptoId);
   await note.save();

   res.status(200).json({
    success: true,
    message: "Note associated successfully",
    note
   });

  } catch (error) {
   res.status(500).json({
    success: false,
    message: error.message
   })
  }



}

export const deleteNote = async (req,res) => {

 const {noteId} = req.params;
 const userId = req.userId;

 try {
  const note = await Note.findOneAndDelete({ _id: noteId, userId: userId });

  if (!note) {
   return res.status(404).json({
    success: false,
    message: "Note not found or unauthorized"
   });
  }
    try {
      await deleteNoteForChroma(noteId);
      logger.info('Note deleted from ChromaDB', { noteId });
    } catch (embeddingError) {
      logger.error('Failed to delete from ChromaDB', {
        noteId,
        error: embeddingError.message,
        stack: embeddingError.stack
      });
    }
    
  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  })
 } catch (error) {
  res.status(400).json({
      success: false,
      message: error.message,
    })
 }
}

