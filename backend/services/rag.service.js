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
const buildContextForGemini = (relevantNotes, userQuery, conversationHistory = [], priceData = '', newsData = '') => {

    // Inject current date/time into prompt to establish temporal context
    // Without this, the LLM may hallucinate dates or misinterpret "today", "yesterday", etc.
    // This ensures accurate calculations when user asks about recent notes or timeframes

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Europe/Rome' 
    });

    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/Rome'
    });
  


    // If no relevant notes, return empty context
    if (!relevantNotes || relevantNotes.length === 0) {

      return `Current Date & Time: ${dateStr}, ${timeStr}
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
    

      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
        conversationHistory.forEach(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          conversationContext += `${role}: ${msg.content}\n`;
        });
        conversationContext += '\n';
      }

        // Build full prompt
        const prompt = `SYSTEM CONTEXT - READ CAREFULLY:
          ===========================================
          TODAY'S DATE: ${dateStr}
          CURRENT TIME: ${timeStr}
          
          CRITICAL INSTRUCTIONS ABOUT TIME:
          - When the user asks about "today", they mean ${dateStr}
          - When they say "yesterday", calculate from today's date
          - When they say "last week", calculate the exact date range
          - NEVER guess or invent dates - always calculate from TODAY's date
          - When referencing notes, always mention how old they are (e.g., "3 days ago", "last week")
          - If you're unsure about a date calculation, say so explicitly

          
          ===========================================
          ${conversationContext} 
          ===========================================

          You are an AI assistant helping a user analyze their personal notes about cryptocurrency and trading.
          
          User Question: "${userQuery}"
          
          ${priceData ? `\nCURRENT CRYPTO PRICES:\n${priceData}\n` : ''}
    
          ${newsData ? `\nLATEST CRYPTO NEWS:\n${newsData}\n` : ''}

          Relevant Notes from User's Knowledge Base:
          ${notesContext}
          
          Instructions:
          1. Answer based PRIMARILY on the notes provided above
          2. If the user asks about news, use the LATEST CRYPTO NEWS section above to provide current information
          3. If the user asks about prices, use the CURRENT CRYPTO PRICES section above
          4. Reference specific notes with their dates (e.g., "In your note from November 10...")
          5. Calculate time references correctly using TODAY's date: ${dateStr}
          6. If notes are old, mention it (e.g., "This note is from 2 weeks ago, so prices may have changed")
          7. Be concise but informative
          8. If you notice contradictions between notes, point them out
          9. Use a friendly, conversational tone
          10. NEVER make up dates or times - always reference the actual dates provided
          11. **WHEN DISCUSSING NEWS: ALWAYS include the source URL in markdown format [Read full article](URL) so users can click to read more** 🔗
          12. OPTIONAL: Only when highly relevant to the context and emotions (bullish news, crashes, celebrations, etc), you MAY occasionally add ONE GIF suggestion using: [GIF:keyword]. Use it sparingly - not in every response, only when it truly enhances the message. Examples: [GIF:rocket] for major bullish news, [GIF:crash] for market drops, [GIF:diamond-hands] for hodl discussion.
          
          Please provide a helpful response:`.trim();
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