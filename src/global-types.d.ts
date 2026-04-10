type Maybe = null | undefined;
type Snowflake = string;
type DiscordApiResponse<T = void> = {
  success: boolean;
  data?: T;
  status?: number;
  error?: unknown;
};
