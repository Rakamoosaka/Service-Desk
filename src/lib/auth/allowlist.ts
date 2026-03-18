import { env } from "@/lib/env";

const allowlistEntries = env.GITLAB_ADMIN_ALLOWLIST.split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

export function isAdminBootstrapCandidate(
  email?: string | null,
  gitlabUserId?: string | null,
) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedGitlabId = gitlabUserId?.trim().toLowerCase();

  return [normalizedEmail, normalizedGitlabId].some(
    (value): value is string =>
      typeof value === "string" &&
      value.length > 0 &&
      allowlistEntries.includes(value),
  );
}
