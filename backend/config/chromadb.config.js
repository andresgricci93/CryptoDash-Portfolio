import { ChromaClient } from 'chromadb';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration based on environment variables
const CHROMA_MODE = process.env.CHROMA_MODE || 'local';

// Function to create ChromaDB client based on mode
const createChromaClient = () => {
  switch (CHROMA_MODE) {
    case 'local':
      // Development mode: embedded ChromaDB with persistent storage
      console.log('ChromaDB LOCAL mode (embedded)');
      return new ChromaClient();

    case 'server':
      // Server mode: separate ChromaDB instance (Docker/VPS)
      const serverUrl = new URL(process.env.CHROMA_URL || 'http://localhost:8000');
      console.log(`ChromaDB SERVER mode - URL: ${serverUrl.href}`);
      return new ChromaClient({
        host: serverUrl.hostname,
        port: serverUrl.port || '8000'
      });

    case 'cloud':
      // Production mode: ChromaDB Cloud (managed service)
      if (!process.env.CHROMA_CLOUD_URL || !process.env.CHROMA_API_KEY) {
        throw new Error('CHROMA_CLOUD_URL and CHROMA_API_KEY required for cloud mode');
      }
      console.log('ChromaDB CLOUD mode');
      return new ChromaClient({
        path: process.env.CHROMA_CLOUD_URL,
        auth: { token: process.env.CHROMA_API_KEY }
      });

    default:
      throw new Error(`Invalid ChromaDB mode: ${CHROMA_MODE}`);
  }
};

// ChromaDB client instance
const client = createChromaClient();

// Collection name for storing note embeddings
export const NOTES_COLLECTION_NAME = "crypto_notes";

// Collection configuration with HNSW parameters
export const collectionConfig = {
  name: NOTES_COLLECTION_NAME,
  metadata: {
    "hnsw:space": "cosine",        // Cosine similarity (best for text embeddings)
    "hnsw:M": 16,                  // Connections per node (default, balanced)
    "hnsw:construction_ef": 100    // Build precision (default, balanced)
  }
};

// Initialize ChromaDB and verify connection
export const initializeChromaDB = async () => {
  try {
    console.log('🔄 Initializing ChromaDB...');
    
    // Verify client connection
    const heartbeat = await client.heartbeat();
    console.log('✅ ChromaDB connected. Heartbeat:', heartbeat);
    
    // Get or create collection
    const collection = await client.getOrCreateCollection({
      name: NOTES_COLLECTION_NAME,
      metadata: collectionConfig.metadata,
      embeddingFunction: null  // Disable auto-embedding, we provide pre-computed vectors
    });
    console.log(`✅ Collection "${NOTES_COLLECTION_NAME}" ready`);
    
    return collection;
  } catch (error) {
    console.error('❌ Error initializing ChromaDB:', error.message);
    throw error;
  }
};

export default client;