export const palette = {
  lavender: "#F5EBFA",
  mist: "#E7DBEF",
  orchid: "#A56ABD",
  plum: "#6E3482",
  grape: "#49225B",
} as const;

export type Verdict = "FEATURED" | "PASS" | "FLAT" | "REJECT" | "REVIEW";
export type EntryStatus = "DRAFT" | "OPEN" | "JUDGING" | "ACCEPTED" | "FEATURED" | "FLAT" | "REJECTED" | "REVIEW" | "ROUND_CLOSED";

export type MilaEntry = {
  id: string;
  parentId?: string;
  roundId: string;
  title: string;
  text: string;
  creator: string;
  status: EntryStatus;
  verdict: Verdict;
  depth: number;
  spark: number;
  evidence: string[];
  decision: {
    humor_band: number;
    novelty_band: number;
    theme_fit: string;
    transformation: string;
    derivative_risk: string;
    safety_band: string;
    reward_band: number;
    parent_consistency: string;
    short_reason: string;
    schema_version: "mila.decision.v1";
    policy_version: "mila.policy.v1";
  };
};

export type MilaRound = {
  id: string;
  epoch: number;
  status: "DRAFT" | "OPEN" | "JUDGING" | "ROUND_CLOSED";
  theme: string;
  prompt: string;
  maxDepth: number;
  seedCap: number;
  mutationCap: number;
  sparkRules: string[];
  safetyProfile: string;
};

export const previewRound: MilaRound = {
  id: "round-04",
  epoch: 4,
  status: "OPEN",
  theme: "Office lore",
  prompt: "The group chat went quiet.",
  maxDepth: 4,
  seedCap: 120,
  mutationCap: 240,
  sparkRules: ["PASS +2", "FEATURED +4", "Parent bonus +1", "5% epoch decay"],
  safetyProfile: "Friendly venue",
};

export const previewEntries: MilaEntry[] = [
  {
    id: "entry-01",
    roundId: "round-04",
    title: "The group chat went quiet.",
    text: "A pause is still a plot twist.",
    creator: "0x7A0f3F1B38cA8f3b01010000000000000003F1",
    status: "FEATURED",
    verdict: "FEATURED",
    depth: 0,
    spark: 12,
    evidence: ["source:prompt", "allowlist:round-theme", "duplicate:none"],
    decision: {
      humor_band: 8,
      novelty_band: 7,
      theme_fit: "strong",
      transformation: "seed premise establishes a clear culture hook",
      derivative_risk: "low",
      safety_band: "green",
      reward_band: 4,
      parent_consistency: "root",
      short_reason: "Clear social tension with flexible mutation space.",
      schema_version: "mila.decision.v1",
      policy_version: "mila.policy.v1",
    },
  },
  {
    id: "entry-02",
    parentId: "entry-01",
    roundId: "round-04",
    title: "The calendar invite said quick sync.",
    text: "It was not a quick sync.",
    creator: "0x4100B9200000000000000000000000000000B92",
    status: "ACCEPTED",
    verdict: "PASS",
    depth: 1,
    spark: 8,
    evidence: ["parent:entry-01", "cooldown:ok", "duplicate:none"],
    decision: {
      humor_band: 7,
      novelty_band: 6,
      theme_fit: "strong",
      transformation: "turns silence into workplace dread",
      derivative_risk: "low",
      safety_band: "green",
      reward_band: 2,
      parent_consistency: "strong",
      short_reason: "Recognizable escalation that fits the office theme.",
      schema_version: "mila.decision.v1",
      policy_version: "mila.policy.v1",
    },
  },
  {
    id: "entry-03",
    parentId: "entry-02",
    roundId: "round-04",
    title: "The meeting had an agenda.",
    text: "The agenda had a meeting.",
    creator: "0x9D0002A000000000000000000000000000002A",
    status: "ACCEPTED",
    verdict: "PASS",
    depth: 2,
    spark: 5,
    evidence: ["parent:entry-02", "depth:2", "duplicate:none"],
    decision: {
      humor_band: 6,
      novelty_band: 7,
      theme_fit: "medium",
      transformation: "adds reversal wordplay",
      derivative_risk: "medium",
      safety_band: "green",
      reward_band: 2,
      parent_consistency: "medium",
      short_reason: "Good mutation, though closer to wordplay than story.",
      schema_version: "mila.decision.v1",
      policy_version: "mila.policy.v1",
    },
  },
  {
    id: "entry-04",
    parentId: "entry-01",
    roundId: "round-04",
    title: "No one asked for a follow-up.",
    text: "So naturally, there were three.",
    creator: "0x2B0008CC0000000000000000000000000008CC",
    status: "REVIEW",
    verdict: "REVIEW",
    depth: 1,
    spark: 3,
    evidence: ["parent:entry-01", "review:context-needed"],
    decision: {
      humor_band: 5,
      novelty_band: 5,
      theme_fit: "medium",
      transformation: "adds meeting-culture escalation",
      derivative_risk: "low",
      safety_band: "green",
      reward_band: 0,
      parent_consistency: "medium",
      short_reason: "Potentially valid, pending stricter parent comparison.",
      schema_version: "mila.decision.v1",
      policy_version: "mila.policy.v1",
    },
  },
];

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getEntry(id: string) {
  return previewEntries.find((entry) => entry.id === id);
}

export function getChildren(id: string) {
  return previewEntries.filter((entry) => entry.parentId === id);
}

export function hasContractAddress() {
  return Boolean(process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS);
}
