import dotenv from 'dotenv';
dotenv.config();


import mongoose from 'mongoose';
import { Note } from '../models/note.model.js';
import { generateEmbedding } from '../services/embedding.services.js';
import { addNote as addNoteToChroma } from '../services/chromadb.service.js';


/**
 * Script to vectorize all existing notes and sync to ChromaDB
 * Run once to migrate existing data
 * Can be executed more than one time to synchronize existing notes.
 * - Safe to run multiple times (updates existing vectors)
 * - Shows progress and statistics
 * - Continues on individual failures
 */

const syncNotesToChroma = async () => {

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
    
        const notes = await Note.find({});
        console.log(`Found ${notes.length} notes to vectorize\n`);
    


        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            
            try {
            console.log(`[${i + 1}/${notes.length}] Processing note ${note._id}...`);
            
              // Generate embedding from textContent
                const embedding = await generateEmbedding(note.textContent);
                
                // Add to ChromaDB, same function integrated in notes.controller.js
                await addNoteToChroma(
                note._id.toString(),
                embedding,
                {
                    userId: note.userId.toString(),
                    title: note.title,
                    tags: (note.tags || []).join(',')
                }
                );



            
            successCount++;
            console.log(`✅ Note ${note._id} synced\n`);
            
            } catch (error) {
            errorCount++;
            errors.push({ noteId: note._id, error: error.message });
            console.error(`❌ Failed: ${error.message}\n`);
            }
        }
      
        console.log('\n' + '='.repeat(50));
        console.log('FINAL REPORT SYNC SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`Total: ${notes.length}`);
        console.log(`Success Rate: ${((successCount / notes.length) * 100).toFixed(1)}%\n`);
        
        // Show errors if any
        if (errors.length > 0) {
          console.log('❌ ERRORS DETAIL:');
          errors.forEach(({ noteId, error }) => {
            console.log(`  - Note ${noteId}: ${error}`);
          });
        }
        
        console.log('\n Sync completed!\n');


    if (notes.length === 0) {
      console.log('No notes to sync. Exiting...');
      return;
    }

    } catch (error) {
     console.error('Fatal error during sync', error.message);
     console.error(error.stack)
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
    }
};

console.log('Starting ChromaDB sync script...\n');
syncNotesToChroma();