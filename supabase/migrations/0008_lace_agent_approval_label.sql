-- ─────────────────────────────────────────────────────────────
-- Lace — Add requested_by_label to agent_approvals.
--
-- Mirrors lace.agent_sessions.actor_label. The agent itself is the
-- usual writer of an approval row, but we want a human-readable
-- "who asked for this?" string without needing to join to app_users
-- (which is empty at this stage). Stores e.g. 'Agent',
-- 'Luz Maria (owner)', 'Playbook: morning_briefing'.
-- ─────────────────────────────────────────────────────────────

alter table lace.agent_approvals
  add column requested_by_label text;
