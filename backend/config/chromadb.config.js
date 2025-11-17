import { ChromaClient, CloudClient } from 'chromadb';
import logger from '../utils/logger.js';

// Configuration based on environment variables
const CHROMA_MODE = process.env.CHROMA_MODE || 'local';

// Function to create ChromaDB client based on mode
const createChromaClient = () => {
  switch (CHROMA_MODE) {
    case 'local':
      console.log('ChromaDB LOCAL mode (embedded)');
      return new ChromaClient();

    case 'server':
      const serverUrl = new URL(process.env.CHROMA_URL || 'http://localhost:8000');
      console.log(`ChromaDB SERVER mode - URL: ${serverUrl.href}`);
      return new ChromaClient({
        host: serverUrl.hostname,
        port: serverUrl.port || '8000'
      });

    case 'cloud':
      if (!process.env.CHROMA_TENANT || !process.env.CHROMA_DATABASE || !process.env.CHROMA_API_KEY) {
        throw new Error('CHROMA_TENANT, CHROMA_DATABASE and CHROMA_API_KEY required for cloud mode');
      }
      console.log('ChromaDB CLOUD mode');
      console.log('Tenant:', process.env.CHROMA_TENANT);
      console.log('Database:', process.env.CHROMA_DATABASE);
      
      return new CloudClient({
        apiKey: process.env.CHROMA_API_KEY,
        tenant: process.env.CHROMA_TENANT,
        database: process.env.CHROMA_DATABASE
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
    "hnsw:space": "cosine",
    "hnsw:M": 16,
    "hnsw:construction_ef": 100
  }
};

// Initialize ChromaDB and verify connection
export const initializeChromaDB = async () => {
  try {
    logger.info('Initializing ChromaDB...');
    
    const heartbeat = await client.heartbeat();
    logger.info('ChromaDB connected', { heartbeat });
    
    const collection = await client.getOrCreateCollection({
      name: NOTES_COLLECTION_NAME,
      metadata: collectionConfig.metadata,
      embeddingFunction: null
    });
    
    logger.info('Collection ready', { 
      collectionName: NOTES_COLLECTION_NAME 
    });
    
    return collection;
  } catch (error) {
    logger.error('Error initializing ChromaDB', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export default client;