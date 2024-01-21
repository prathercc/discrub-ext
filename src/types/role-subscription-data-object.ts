// https://discord.com/developers/docs/resources/channel#role-subscription-data-object
export type RoleSubscriptionDataObject = {
  role_subscription_listing_id: Snowflake;
  tier_name: string;
  total_months_subscribed: number;
  is_renewal: boolean;
};
