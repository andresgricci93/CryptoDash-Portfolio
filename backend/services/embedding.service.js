import { pipeline } from '@xenova/transformers';

/**
 * Embedding Service (Functional)
 * Converts text to vector embeddings using Transformers.js
 * Model: all-MiniLM-L6-v2 (384 dimensions, optimized for semantic search)
 */

// Module-level state (singleton pattern)
let extractor = null;
let isInitialized = false;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;
const MAX_TOKEN_LENGTH = 512; // Model's maximum token limit
const MIN_TEXT_LENGTH = 3; // Minimum characters required
const AVG_CHARS_PER_TOKEN = 4; // Approximate ratio

/**
 * Initialize the embedding model
 * Downloads and caches the model on first run (~90MB)
 * @returns {Promise<void>}
 */


const initialize = async () => {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Loading embedding model...');
    console.log(`Model: ${MODEL_NAME}`);
    
    extractor = await pipeline(
      'feature-extraction',
      MODEL_NAME,
      { quantized: true }
    );
    
    isInitialized = true;
    console.log('Embedding model loaded successfully');
  } catch (error) {
    console.error('Error loading embedding model:', error.message);
    throw new Error(`Failed to initialize embedding model: ${error.message}`);
  }
};

/**
 * Generate embedding vector from text
 * @param {string} text - Input text to embed
 * @returns {Promise<number[]>} 384-dimensional embedding vector
 */
const generateEmbedding = async (text) => {
  if (!isInitialized) {
    await initialize();
  }

  // Validate input type
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  const cleanText = text.trim();
  
  // Validate minimum length
  if (cleanText.length < MIN_TEXT_LENGTH) {
    throw new Error(`Invalid input: text must be at least ${MIN_TEXT_LENGTH} characters`);
  }

  // Validate maximum length
  const maxChars = MAX_TOKEN_LENGTH * AVG_CHARS_PER_TOKEN;
  if (cleanText.length > maxChars) {
    throw new Error(
      `Text too long: ${cleanText.length} characters (max ${maxChars}). ` +
      `Consider splitting into smaller chunks.`
    );
  }

  try {
    const output = await extractor(cleanText, {
      pooling: 'mean',
      normalize: true
    });

    const embedding = Array.from(output.data);
    
    // Validate output dimension
    if (embedding.length !== EMBEDDING_DIMENSION) {
      throw new Error(
        `Unexpected embedding dimension: ${embedding.length} (expected ${EMBEDDING_DIMENSION})`
      );
    }
    
    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
const generateBatchEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('Invalid input: texts must be a non-empty array');
  }

  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  );

  return embeddings;
};

/**
 * Get embedding dimension size
 * @returns {number} Dimension size (384 for all-MiniLM-L6-v2)
 */
const getDimension = () => {
  return EMBEDDING_DIMENSION;
};

/**
 * Get model information
 * @returns {object} Model details
 */
const getModelInfo = () => {
  return {
    name: MODEL_NAME,
    dimension: EMBEDDING_DIMENSION,
    initialized: isInitialized,
    maxTokens: MAX_TOKEN_LENGTH,
    minChars: MIN_TEXT_LENGTH,
    description: 'Sentence-BERT model optimized for semantic similarity'
  };
};

/**
 * Check if model is initialized
 * @returns {boolean}
 */
const isModelInitialized = () => {
  return isInitialized;
};

// Export all functions
export {
  initialize,
  generateEmbedding,
  generateBatchEmbeddings,
  getDimension,
  getModelInfo,
  isModelInitialized
};

// Default export for convenience
export default {
  initialize,
  generateEmbedding,
  generateBatchEmbeddings,
  getDimension,
  getModelInfo,
  isModelInitialized
};