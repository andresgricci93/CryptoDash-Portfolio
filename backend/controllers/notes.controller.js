import { Note } from "../models/note.model.js";



export const createNote = async (req,res) => {

 const {title, htmlContent,textContent, tags} = req.body;
 const userId = req.userId;


 try {

    const note = new Note({
        title,
        htmlContent,
        textContent,
        tags: tags || [],
        userId
    });

    await note.save();

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

export const associateNoteWithCrypto = async (req, res) => {
  try {
    const { noteId, cryptoId } = req.body;
    const userId = req.userId;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: userId },
      { cryptoId: cryptoId },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note associated with crypto successfully",
      note
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

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

