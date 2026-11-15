/** Shared by the static form and the temporary, local-only receiver. */
export const posterRules = {
  maxFileSizeMb: 20,
  maxFileBytes: 20 * 1024 * 1024,
  accept: ".pdf,application/pdf",
  maxNameLength: 150,
  maxAffiliationLength: 250,
  maxEmailLength: 254,
} as const;
