import { generateEmbedding } from './embedding.service.js';
import { searchSimilar } from './chromadb.service.js';
import { Note } from '../models/note.model.js';


/**
 * Search for relevant notes based on a user query
 * @param {string} query - User's question or search term
 * @param {string} userId - User ID to filter results
 * @param {number} limit - Max number of results (default: 5)
 * @returns {Promise<Array>} Array of relevant notes with content and similarity scores
 */


const searchRelevantNotes = async (query, userId, limit = 5) => {
    try {
  
      const queryEmbedding = await generateEmbedding(query);
      
  
      const vectorResults = await searchSimilar(
        queryEmbedding, 
        limit * 2,  // Get more results to filter by userId
        { userId: userId }  // Filter by user
      );
      

      const noteIds = vectorResults.map(result => result.id);
      
      if (noteIds.length === 0) {
        return [];
      }

      const notes = await Note.find({ 
        _id: { $in: noteIds },
        userId: userId 
      });
      
     
      const enrichedResults = vectorResults.map(vectorResult => {
        const note = notes.find(n => n._id.toString() === vectorResult.id);
        
        return {
          noteId: vectorResult.id,
          similarity: vectorResult.similarity,
          title: note?.title || 'Untitled',
          textContent: note?.textContent || '',
          htmlContent: note?.htmlContent || '',
          tags: note?.tags || [],
          createdAt: note?.createdAt
        };
      }).filter(result => result.textContent); 
      
     
      return enrichedResults.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error searching relevant notes:', error.message);
      throw new Error(`Failed to search relevant notes: ${error.message}`);
    }
  };

  /**
 * Build context string for Gemini from relevant notes
 * @param {Array} relevantNotes - Array of notes from searchRelevantNotes
 * @param {string} userQuery - Original user question
 * @returns {string} Formatted context for LLM
 */
const buildContextForGemini = (relevantNotes, userQuery) => {
    // If no relevant notes, return empty context
    if (!relevantNotes || relevantNotes.length === 0) {
      return `
  User Question: "${userQuery}"
  
  Context: No relevant notes found in your personal knowledge base.
  
  Please provide a general response based on your knowledge, and mention that the user hasn't saved any notes about this topic yet.
      `.trim();
    }
    
    // Build context from notes
    const notesContext = relevantNotes.map((note, index) => {
      return `
  --- Note ${index + 1} (Relevance: ${(note.similarity * 100).toFixed(0)}%) ---
  Title: ${note.title}
  Date: ${new Date(note.createdAt).toLocaleDateString()}
  Content:
  ${note.textContent}
  ${note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}` : ''}
      `.trim();
    }).join('\n\n');
    
    // Build full prompt
    const prompt = `
  You are an AI assistant helping a user analyze their personal notes about cryptocurrency and trading.
  
  User Question: "${userQuery}"
  
  Relevant Notes from User's Knowledge Base:
  ${notesContext}
  
  Instructions:
  1. Answer the user's question based PRIMARILY on the notes provided above
  2. Reference specific notes when relevant (e.g., "According to your note from...")
  3. If the notes don't fully answer the question, you can add general knowledge but clearly distinguish it
  4. Be concise but informative
  5. If you notice contradictions between notes, point them out
  6. Use a friendly, conversational tone
  
  Please provide a helpful response:
    `.trim();
    
    return prompt;
  };

  export {
    searchRelevantNotes,
    buildContextForGemini
  };
  
  export default {
    searchRelevantNotes,
    buildContextForGemini
  };