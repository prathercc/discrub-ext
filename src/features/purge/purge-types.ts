export type PurgeState = {
  isLoading: boolean | null;
};

export enum PurgeStatus {
  // Ambiguous
  IN_PROGRESS = "In Progress",
  REMOVED = "Removed",
  MISSING_PERMISSION = "Missing Permission",
  MESSAGE_NON_REMOVABLE = "Non-Removable",

  // Attachments
  ATTACHMENTS_KEPT = "Attachments Kept",

  // Reactions
  REACTIONS_REMOVED = "Reactions Removed",
  REACTIONS_PARTIALLY_REMOVED = "Reactions Partially Removed",
  NO_REACTIONS_FOUND = "Reactions Not Found",
}
