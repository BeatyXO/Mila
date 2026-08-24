import unittest

from contracts.mila import Decision, EntryStatus, MilaProtocol


class MilaProtocolTest(unittest.TestCase):
    def setUp(self):
        self.contract = MilaProtocol("admin")
        self.round_id = self.contract.create_round("admin", "Office lore", "The group chat went quiet.", 100, 1000)
        self.contract.open_round("admin", self.round_id)

    def decision(self, verdict="PASS"):
        return Decision(
            verdict=verdict,
            humor_band=7,
            novelty_band=7,
            theme_fit="strong",
            transformation="meaningful",
            derivative_risk="low",
            safety_band="green",
            reward_band=2,
            parent_consistency="strong",
            short_reason="Fits the prompt and changes the parent.",
            evidence=("duplicate:none",),
        )

    def test_seed_judgment_awards_spark(self):
        entry_id = self.contract.submit_seed("creator", self.round_id, "Seed", "ipfs://seed", "A pause is a plot twist.", now=130)
        self.contract.request_judgment("creator", entry_id)
        self.contract.settle_judgment("admin", entry_id, self.decision("PASS"))
        self.assertEqual(self.contract.get_entry(entry_id).status, EntryStatus.ACCEPTED)
        self.assertEqual(self.contract.get_creator_spark("creator"), 2)

    def test_mutation_requires_accepted_parent(self):
        entry_id = self.contract.submit_seed("creator", self.round_id, "Seed", "ipfs://seed", "A pause is a plot twist.", now=130)
        with self.assertRaises(ValueError):
            self.contract.submit_mutation("mutator", entry_id, "Mut", "ipfs://mut", "A follow-up appeared.", now=200)

    def test_featured_mutation_awards_parent_bonus(self):
        parent_id = self.contract.submit_seed("creator", self.round_id, "Seed", "ipfs://seed", "A pause is a plot twist.", now=130)
        self.contract.request_judgment("creator", parent_id)
        self.contract.settle_judgment("admin", parent_id, self.decision("PASS"))
        child_id = self.contract.submit_mutation("mutator", parent_id, "Mut", "ipfs://mut", "A quick sync appeared.", now=200)
        self.contract.request_judgment("mutator", child_id)
        self.contract.settle_judgment("admin", child_id, self.decision("FEATURE"))
        self.assertEqual(self.contract.get_creator_spark("mutator"), 4)
        self.assertEqual(self.contract.get_creator_spark("creator"), 3)
        self.assertEqual(self.contract.get_lineage(child_id), [parent_id, child_id])

    def test_duplicate_and_cooldown_are_rejected(self):
        self.contract.submit_seed("creator", self.round_id, "Seed", "ipfs://seed", "A pause is a plot twist.", now=130)
        with self.assertRaises(ValueError):
            self.contract.submit_seed("creator", self.round_id, "Fast", "ipfs://fast", "Another body.", now=140)
        with self.assertRaises(ValueError):
            self.contract.submit_seed("other", self.round_id, "Dupe", "ipfs://dupe", "A pause is a plot twist.", now=200)

    def test_epoch_decay(self):
        entry_id = self.contract.submit_seed("creator", self.round_id, "Seed", "ipfs://seed", "A pause is a plot twist.", now=130)
        self.contract.request_judgment("creator", entry_id)
        self.contract.settle_judgment("admin", entry_id, self.decision("FEATURE"))
        self.contract.advance_epoch("admin")
        self.assertEqual(self.contract.get_creator_spark("creator"), 3)


if __name__ == "__main__":
    unittest.main()
