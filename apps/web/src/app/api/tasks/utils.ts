export function createTaskContentForEmbedding(
  title: string,
  description?: string | null
): string {
  if (description) {
    return `${title}\n\n${description}`;
  }
  return title;
}
