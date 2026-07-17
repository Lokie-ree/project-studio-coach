import { components } from "./_generated/api";
import { RAG, defaultChunker } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

/**
 * Knowledge retrieval for the coach.
 *
 * One shared namespace ("knowledge"); coaching stage is a FILTER, not a
 * namespace, because coaching-transcripts must be retrievable at every stage
 * (it is the voice). Filters with the same name are OR'd at query time, so
 * stage-specific queries always include { stage: "all" }.
 *
 * EMBEDDING DIMENSION IS PINNED: text-embedding-3-small = 1536. Changing the
 * model means changing this number AND re-ingesting everything. Do not touch
 * one without the other.
 */
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSION = 1536;

type FilterTypes = {
  stage: string; // "narrow" | "shape" | "all"
  docType: string; // "coaching-transcript" | "scope-example" | "milestone-zero"
};

export const rag = new RAG<FilterTypes>(components.rag, {
  textEmbeddingModel: openai.embedding(EMBEDDING_MODEL),
  embeddingDimension: EMBEDDING_DIMENSION,
  filterNames: ["stage", "docType"],
});

/**
 * Header-aware chunking. The founding markdown is organized in sections
 * (## / ### headings) where each section is one coherent example — a
 * before/after scope rewrite, one Milestone Zero, one rung of the ladder.
 * Never split an example in half; fall back to paragraph chunking only for
 * oversized sections (long transcript passages), and rely on chunkContext at
 * search time to recover surrounding dialogue.
 */
export function chunkByHeaders(markdown: string): string[] {
  return markdown
    .split(/\n(?=#{2,3} )/)
    .flatMap((section) =>
      section.length <= 4000
        ? [section]
        : defaultChunker(section, {
            maxCharsSoftLimit: 2000,
            maxCharsHardLimit: 10000,
          }),
    )
    .map((c) => c.trim())
    .filter(Boolean);
}
