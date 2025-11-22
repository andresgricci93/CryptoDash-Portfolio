import chromaClient, { 
    NOTES_COLLECTION_NAME, 
    initializeChromaDB 
  } from '../config/chromadb.config.js';
import logger from '../utils/logger.js';

  /**
   * ChromaDB Service (Functional)
   * Handles all vector storage operations for notes
   * Manages embeddings, metadata, and semantic search
   */
  
  // Module-level state
  let collection = null;
  let isInitialized = false;
  
  /**
   * Initialize ChromaDB collection
   * Must be called before any other operation
   * @returns {Promise<void>}
   */
  const initialize = async () => {
    if (isInitialized) {
      return;
    }
  
    try {
      collection = await initializeChromaDB();
      isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize ChromaDB service:', error.message);
      throw error;
    }
  };
  
  /**
   * Add a note with its embedding to ChromaDB
   * @param {string} noteId - Unique note identifier (MongoDB _id)
   * @param {number[]} embedding - 384-dimensional vector
   * @param {object} metadata - Note metadata (userId, title, tags, etc.)
   * @returns {Promise<void>}
   **/
  const addNote = async (noteId, embedding, metadata) => {
    // Ensure collection is initialized
    if (!isInitialized) {
      await initialize();
    }
  
    // Validate inputs
    if (!noteId || typeof noteId !== 'string') {
      throw new Error('Invalid noteId: must be a non-empty string');
    }
  
    if (!Array.isArray(embedding) || embedding.length !== 384) {
      throw new Error('Invalid embedding: must be an array of 384 numbers');
    }
  
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Invalid metadata: must be an object');
    }
  
    try {
      await collection.add({
        ids: [noteId],
        embeddings: [embedding],
        metadatas: [metadata]
      });
  
      logger.info('Note added to ChromaDB', { 
        noteId, 
        title: metadata.title,
        userId: metadata.userId 
      });
    } catch (error) {
      logger.error('Error adding note to ChromaDB', {
        noteId,
        error: error.message,
        stack: error.stack,
        metadata
      });
      throw new Error(`Failed to add note to vector store: ${error.message}`);
    }
  };
  
  /**
   * Search for similar notes using semantic search
   * @param {number[]} queryEmbedding - Query vector (384 dimensions)
   * @param {number} limit - Maximum number of results (default: 5)
   * @param {object} filter - Optional metadata filter
   * @returns {Promise<Array>} Array of similar notes with scores
   */

  
  const searchSimilar = async (queryEmbedding, limit = 5, filter = null) => {
    // Ensure collection is initialized
    if (!isInitialized) {
      await initialize();
    }
  
    // Validate inputs
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 384) {
      throw new Error('Invalid queryEmbedding: must be an array of 384 numbers');
    }
  
    if (typeof limit !== 'number' || limit < 1) {
      throw new Error('Invalid limit: must be a positive number');
    }
  
    try {
      const queryOptions = {
        queryEmbeddings: [queryEmbedding],
        nResults: limit
      };
  
      // Add metadata filter if provided
      if (filter) {
        queryOptions.where = filter;
      }
  
      const results = await collection.query(queryOptions);
      

      // Format results
      const formattedResults = [];
      
      if (results.ids && results.ids[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          formattedResults.push({
            id: results.ids[0][i],
            distance: results.distances[0][i],
            similarity: 1 - results.distances[0][i], // Convert distance to similarity
            metadata: results.metadatas[0][i]
          });
        }
      }
  
      logger.info('Similar notes found', { 
        count: formattedResults.length,
        limit 
      });
      
      console.log(`Found ${formattedResults.length} similar notes`);
      return formattedResults;
    } catch (error) {
      logger.error('Error searching similar notes', {
        error: error.message,
        stack: error.stack,
        limit,
        hasFilter: !!filter
      });
      throw new Error(`Failed to search vector store: ${error.message}`);
    }
  };
  
  /**
   * Update a note's embedding and metadata
   * @param {string} noteId - Note identifier
   * @param {number[]} embedding - New 384-dimensional vector
   * @param {object} metadata - Updated metadata
   * @returns {Promise<void>}
   */
  const updateNote = async (noteId, embedding, metadata) => {
    // Ensure collection is initialized
    if (!isInitialized) {
      await initialize();
    }
  
    // Validate inputs
    if (!noteId || typeof noteId !== 'string') {
      throw new Error('Invalid noteId: must be a non-empty string');
    }
  
    if (!Array.isArray(embedding) || embedding.length !== 384) {
      throw new Error('Invalid embedding: must be an array of 384 numbers');
    }
  
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Invalid metadata: must be an object');
    }
  
    try {
      await collection.update({
        ids: [noteId],
        embeddings: [embedding],
        metadatas: [metadata]
      });
  
      logger.info('Note updated in ChromaDB', { 
        noteId,
        title: metadata.title 
      });
    } catch (error) {
      logger.error('Error updating note in ChromaDB', {
        noteId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to update note in vector store: ${error.message}`);
    }
  };
  
  /**
   * Delete a note from ChromaDB
   * @param {string} noteId - Note identifier
   * @returns {Promise<void>}
   */
  const deleteNote = async (noteId) => {
    // Ensure collection is initialized
    if (!isInitialized) {
      await initialize();
    }
  
    // Validate input
    if (!noteId || typeof noteId !== 'string') {
      throw new Error('Invalid noteId: must be a non-empty string');
    }
  
    try {
      await collection.delete({
        ids: [noteId]
      });
  
      logger.info('Note deleted from ChromaDB', { noteId });
    } catch (error) {
      logger.error('Error deleting note from ChromaDB', {
        noteId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to delete note from vector store: ${error.message}`);
    }
  };
  
  /**
   * Get a note by ID from ChromaDB
   * @param {string} noteId - Note identifier
   * @returns {Promise<object|null>} Note data or null if not found
   */
  const getNoteById = async (noteId) => {
    // Ensure collection is initialized
    if (!isInitialized) {
      await initialize();
    }
  
    // Validate input
    if (!noteId || typeof noteId !== 'string') {
      throw new Error('Invalid noteId: must be a non-empty string');
    }
  
    try {
      const result = await collection.get({
        ids: [noteId]
      });
  
      if (result.ids && result.ids.length > 0) {
        return {
          id: result.ids[0],
          embedding: result.embeddings ? result.embeddings[0] : null,
          metadata: result.metadatas ? result.metadatas[0] : null
        };
      }
  
      return null;
    } catch (error) {
      console.error(`❌ Error getting note ${noteId}:`, error.message);
      throw new Error(`Failed to get note from vector store: ${error.message}`);
    }
  };
  
  /**
   * Get total count of notes in ChromaDB
   * @returns {Promise<number>} Total count
   */
  const getCount = async () => {
    if (!isInitialized) {
      await initialize();
    }
  
    try {
      const count = await collection.count();
      return count;
    } catch (error) {
      console.error('❌ Error getting count:', error.message);
      throw new Error(`Failed to get count: ${error.message}`);
    }
  };
  
  /**
   * Delete all notes from ChromaDB (use with caution!)
   * @returns {Promise<void>}
   */
  const deleteAll = async () => {
    if (!isInitialized) {
      await initialize();
    }
  
    try {
      // Get all IDs
      const allNotes = await collection.get();
      
      if (allNotes.ids && allNotes.ids.length > 0) {
        await collection.delete({
          ids: allNotes.ids
        });
        console.log(`Deleted ${allNotes.ids.length} notes from ChromaDB`);
      } else {
        console.log('No notes to delete');
      }
    } catch (error) {
      console.error('❌ Error deleting all notes:', error.message);
      throw new Error(`Failed to delete all notes: ${error.message}`);
    }
  };
  
  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  const isServiceInitialized = () => {
    return isInitialized;
  };
  
  // Export all functions
  export {
    initialize,
    addNote,
    searchSimilar,
    updateNote,
    deleteNote,
    getNoteById,
    getCount,
    deleteAll,
    isServiceInitialized
  };
  
  // Default export for convenience
  export default {
    initialize,
    addNote,
    searchSimilar,
    updateNote,
    deleteNote,
    getNoteById,
    getCount,
    deleteAll,
    isServiceInitialized
  };