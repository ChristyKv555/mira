import { getGeminiClient } from "./helpers";

const EMBEDDING_MODEL = "gemini-embedding-001" as const;
const EMBEDDING_DIMENSIONS = 1536 as const;

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();

  try {
    const result = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: { outputDimensionality: EMBEDDING_DIMENSIONS },
    });

    // Access embedding values from the result
    const embedding = result.embeddings?.[0];
    if (!embedding || !embedding.values) {
      throw new Error("No embedding values returned from API");
    }

    return Array.from(embedding.values) as number[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw new Error("Failed to generate embedding: Unknown error");
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getGeminiClient();

  if (texts.length === 0) {
    return [];
  }

  try {
    const result = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
      config: { outputDimensionality: EMBEDDING_DIMENSIONS },
    });

    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error("No embeddings returned from API");
    }

    // Map embeddings to arrays of numbers
    return result.embeddings.map((embedding) => {
      if (!embedding.values) {
        throw new Error("Embedding missing values");
      }
      return Array.from(embedding.values) as number[];
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
    throw new Error("Failed to generate embeddings: Unknown error");
  }
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
