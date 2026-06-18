import { Pinecone } from "@pinecone-database/pinecone";
import { CohereEmbeddings } from "@langchain/cohere";
import { env } from "./env";

// Cohere embed-english-v3.0 — 1024 dimensions
export const cohereEmbeddings = new CohereEmbeddings({
  apiKey: env.COHERE_API_KEY,
  model: "embed-english-v3.0",
});

// Pinecone client — index must be dimension=1024, metric=cosine
export const pineconeClient = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const getPineconeIndex = () => pineconeClient.Index(env.PINECONE_INDEX);
