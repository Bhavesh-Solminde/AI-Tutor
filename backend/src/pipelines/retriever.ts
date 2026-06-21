import { PineconeStore } from "@langchain/pinecone";
import { cohereEmbeddings, getPineconeIndex } from "../config/pinecone";
import { Session } from "../models/Session";

/**
 * RAG retrieval pipeline.
 * Maps to n8n: Embeddings Cohere (retrieve) → Pinecone Vector Store (retrieve-as-tool)
 *
 * Embeds the query using Cohere embed-english-v3.0, searches Pinecone
 * with namespace filter for the user's session, returns formatted context string.
 */
export async function retrieveContext(
  query: string,
  userId: string,
  sessionId: string,
  topK: number = 5
): Promise<string> {
  const namespace = `${userId}_${sessionId}`;
  const pineconeIndex = getPineconeIndex();

  const vectorStore = await PineconeStore.fromExistingIndex(cohereEmbeddings, {
    pineconeIndex,
    namespace,
  });

  const docs = await vectorStore.similaritySearch(query, topK);

  if (docs.length === 0) {
    return "No relevant context found in the uploaded materials.";
  }

  const context = docs
    .map((doc, i) => `[Chunk ${i + 1}]\n${doc.pageContent}`)
    .join("\n\n---\n\n");

  return context;
}

/**
 * RAG retrieval using a pre-built Pinecone namespace string.
 * Use this when the namespace is already known (e.g. from materialNamespaces array)
 * to avoid incorrect namespace re-derivation from userId + sessionId.
 */
export async function retrieveContextByNamespace(
  query: string,
  namespace: string,
  topK: number = 5
): Promise<string> {
  const pineconeIndex = getPineconeIndex();

  const vectorStore = await PineconeStore.fromExistingIndex(cohereEmbeddings, {
    pineconeIndex,
    namespace,
  });

  const docs = await vectorStore.similaritySearch(query, topK);

  if (docs.length === 0) {
    return "No relevant context found in the uploaded materials.";
  }

  return docs
    .map((doc, i) => `[Chunk ${i + 1}]\n${doc.pageContent}`)
    .join("\n\n---\n\n");
}


/**
 * Multi-namespace RAG retrieval.
 * Queries multiple Pinecone namespaces in parallel (topic session + attached materials),
 * merges results, and returns a combined context string.
 * Used when the user selects reference materials in the chat's Materials modal.
 */
export async function retrieveFromMultipleNamespaces(
  query: string,
  namespaces: string[],
  topK: number = 4
): Promise<string> {
  if (namespaces.length === 0) {
    return "No relevant context found in the uploaded materials.";
  }

  const pineconeIndex = getPineconeIndex();

  // Query all namespaces in parallel
  const results = await Promise.allSettled(
    namespaces.map(async (namespace) => {
      const vectorStore = await PineconeStore.fromExistingIndex(cohereEmbeddings, {
        pineconeIndex,
        namespace,
      });
      const docs = await vectorStore.similaritySearch(query, topK);
      return docs.map((doc) => ({ content: doc.pageContent, namespace }));
    })
  );

  // Collect all chunks, deduplicate by content
  const seen = new Set<string>();
  const allChunks: Array<{ content: string; namespace: string }> = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const chunk of result.value) {
        if (!seen.has(chunk.content)) {
          seen.add(chunk.content);
          allChunks.push(chunk);
        }
      }
    }
  }

  if (allChunks.length === 0) {
    return "No relevant context found in the uploaded materials.";
  }

  return allChunks
    .map((chunk, i) => `[Chunk ${i + 1}]\n${chunk.content}`)
    .join("\n\n---\n\n");
}

/**
 * Open-mode RAG retrieval.
 * Retrieves context from the 5 most recent active sessions of the user.
 */
export async function retrieveFromAllUserSessions(
  query: string,
  userId: string,
  topK: number = 5
): Promise<string> {
  try {
    const recentSessions = await Session.find({ userId, deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5);

    if (recentSessions.length === 0) {
      return "No uploaded materials found. Use your knowledge.";
    }

    const namespaces = recentSessions
      .map((s) => s.pineconeNamespace)
      .filter((ns) => !!ns);

    if (namespaces.length === 0) {
      return "No uploaded materials found. Use your knowledge.";
    }

    return await retrieveFromMultipleNamespaces(query, namespaces, topK);
  } catch (error) {
    console.error("Error in retrieveFromAllUserSessions:", error);
    return "No relevant context found in the uploaded materials.";
  }
}
