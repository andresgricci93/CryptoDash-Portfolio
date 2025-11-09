import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Note } from '../models/note.model.js';
import { searchRelevantNotes, buildContextForGemini } from '../services/rag.service.js';

const testRAG = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get any note to extract userId
    const anyNote = await Note.findOne();
    
    if (!anyNote) {
      console.log('❌ No notes found. Create a note first.');
      process.exit(1);
    }
    
    const userId = anyNote.userId.toString();
    console.log(` Using userId: ${userId}\n`);
    
    const query = 'whats my strategy about bitcoin?';  // ← Cambiá esto por lo que quieras buscar
    
    console.log(` Query: "${query}"\n`);
    
    // Step 1: Search relevant notes
    console.log(' Searching relevant notes...');
    const notes = await searchRelevantNotes(query, userId, 3);
    
    console.log(`✅ Found ${notes.length} relevant notes:\n`);
    notes.forEach((note, i) => {
      console.log(`${i + 1}. ${note.title}`);
      console.log(`   Similarity: ${(note.similarity * 100).toFixed(1)}%`);
      console.log(`   Preview: ${note.textContent.substring(0, 100)}...\n`);
    });
    
    // Step 2: Build context
    console.log('Building context for Gemini...\n');
    const context = buildContextForGemini(notes, query);
    
    console.log(' GENERATED PROMPT:');
    console.log('='.repeat(60));
    console.log(context);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testRAG();