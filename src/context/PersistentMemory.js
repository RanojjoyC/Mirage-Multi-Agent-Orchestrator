const { Pinecone } = require("@pinecone-database/pinecone");

class PersistentMemory {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    this.indexName = process.env.PINECONE_INDEX_NAME || "mirage-memory";
    this.index = this.pinecone.Index(this.indexName);
    this.localCache = {};
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      await this.index.describeIndexStats();
      console.log("✅ Pinecone connected");
    } catch (err) {
      console.error("❌ Pinecone connection failed", err);
    }
  }

  // Generate a simple embedding from text using hash-based approach
  generateEmbedding(text) {
    const embedding = new Array(384).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Distribute hash across embedding
    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin((hash + i) * 0.1) * 10;
    }
    return embedding;
  }

  async get(key) {
    if (this.localCache[key]) {
      return this.localCache[key];
    }
    
    try {
      const embedding = this.generateEmbedding(key);
      const results = await this.index.query({
        vector: embedding,
        topK: 1,
        includeMetadata: true
      });
      
      if (results.matches && results.matches.length > 0) {
        const value = results.matches[0].metadata?.value;
        this.localCache[key] = value;
        return value;
      }
    } catch (err) {
      console.error("❌ Failed to retrieve from Pinecone", err);
    }
    return undefined;
  }

  async set(key, value) {
    try {
      const embedding = this.generateEmbedding(key);
      await this.index.upsert([
        {
          id: key,
          values: embedding,
          metadata: {
            key,
            value,
            timestamp: new Date().toISOString()
          }
        }
      ]);
      this.localCache[key] = value;
    } catch (err) {
      console.error("❌ Failed to store in Pinecone", err);
      throw err;
    }
  }

  async getAll() {
    try {
      // Store vectors for retrieval
      const memory = {};
      for (const key of Object.keys(this.localCache)) {
        memory[key] = this.localCache[key];
      }
      return memory;
    } catch (err) {
      console.error("❌ Failed to retrieve all from Pinecone", err);
      return {};
    }
  }

  async close() {
    this.localCache = {};
  }
}

module.exports = PersistentMemory;
