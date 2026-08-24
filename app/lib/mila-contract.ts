import { z } from "zod";
import { readMila } from "./genlayer";

export const DecisionVerdictSchema = z.enum(["FEATURE", "PASS", "FLAT", "REJECT", "REVIEW", ""]);
export const EntryStatusSchema = z.enum(["OPEN", "JUDGING", "ACCEPTED", "FEATURED", "FLAT", "REJECTED", "REVIEW", "ROUND_CLOSED"]);

export const RoundSchema = z.object({
  id: z.string(),
  owner: z.string(),
  theme: z.string(),
  prompt: z.string(),
  opens_at: z.union([z.number(), z.bigint(), z.string()]),
  closes_at: z.union([z.number(), z.bigint(), z.string()]),
  max_depth: z.union([z.number(), z.bigint(), z.string()]),
  seed_cap: z.union([z.number(), z.bigint(), z.string()]),
  mutation_cap: z.union([z.number(), z.bigint(), z.string()]),
  status: z.string(),
  policy_version: z.string(),
});

export const EntrySchema = z.object({
  id: z.string(),
  round_id: z.string(),
  creator: z.string(),
  title: z.string(),
  content: z.string(),
  content_hash: z.string(),
  parent_id: z.string(),
  depth: z.union([z.number(), z.bigint(), z.string()]),
  status: EntryStatusSchema,
  created_at: z.union([z.number(), z.bigint(), z.string()]),
});

export const DecisionSchema = z.object({
  verdict: DecisionVerdictSchema,
  humor_band: z.union([z.number(), z.bigint(), z.string()]),
  novelty_band: z.union([z.number(), z.bigint(), z.string()]),
  theme_fit: z.string(),
  transformation: z.string(),
  derivative_risk: z.string(),
  safety_band: z.string(),
  reward_band: z.union([z.number(), z.bigint(), z.string()]),
  parent_consistency: z.string(),
  short_reason: z.string(),
  schema_version: z.string(),
  policy_version: z.string(),
  evidence: z.string(),
});

export const SummarySchema = z.object({
  admin: z.string(),
  epoch: z.number(),
  round_count: z.number(),
  entry_count: z.number(),
  badge_count: z.number(),
  schema_version: z.string(),
  policy_version: z.string(),
});

export const ReactionsSchema = z.object({
  laugh: z.number(),
  smart: z.number(),
  wild: z.number(),
});

export const milaReads = {
  getSummary: async () => SummarySchema.parse(await readMila("get_summary")),
  getRound: async (roundId: string) => RoundSchema.parse(await readMila("get_round", [roundId])),
  getEntry: async (entryId: string) => EntrySchema.parse(await readMila("get_entry", [entryId])),
  getJudgment: async (entryId: string) => DecisionSchema.parse(await readMila("get_judgment", [entryId])),
  getChildren: async (entryId: string, offset = 0, limit = 20) => z.array(z.string()).parse(await readMila("get_children", [entryId, BigInt(offset), BigInt(limit)])),
  getLineage: async (entryId: string) => z.array(z.string()).parse(await readMila("get_lineage", [entryId])),
  getCreatorSpark: async (creator: `0x${string}`) => z.union([z.number(), z.bigint(), z.string()]).parse(await readMila("get_creator_spark", [creator])),
  getCreatorHistory: async (creator: `0x${string}`, offset = 0, limit = 20) =>
    z.array(z.string()).parse(await readMila("get_creator_history", [creator, BigInt(offset), BigInt(limit)])),
  getRoundFeed: async (roundId: string, offset = 0, limit = 20) => z.array(z.string()).parse(await readMila("get_round_feed", [roundId, BigInt(offset), BigInt(limit)])),
  getReactions: async (entryId: string) => ReactionsSchema.parse(await readMila("get_reactions", [entryId])),
  getBadge: async (badgeId: string) => z.unknown().parse(await readMila("get_badge", [badgeId])),
};
