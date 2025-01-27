import Channel from "../../classes/channel";

export type PurgeState = {
  isLoading: boolean | null;
  purgeChannel: Channel | null;
};

export enum PurgeStatus {
  IN_PROGRESS = "In Progress",
  REMOVED = "Removed",
  MISSING_PERMISSION = "Missing Permission",
}
