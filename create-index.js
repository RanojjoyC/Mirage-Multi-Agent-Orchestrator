const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function createIndex() {
  console.log("API Key:", process.env.PINECONE_API_KEY ? "✅ Found" : "❌ Missing");
  const pinecone = new Pinecone();

  await pinecone.createIndex({
    name: "mirage-memory",
    dimension: 384,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1"
      }
    }
  });
  console.log("✅ Index created!");
}

createIndex().catch(console.error);
