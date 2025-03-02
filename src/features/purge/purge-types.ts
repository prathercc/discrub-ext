export type PurgeState = {
  isLoading: boolean | null;
};

export enum PurgeStatus {
  IN_PROGRESS = "In Progress",
  REMOVED = "Removed",
  MISSING_PERMISSION = "Missing Permission",
  ATTACHMENTS_KEPT = "Attachments Kept",
}
