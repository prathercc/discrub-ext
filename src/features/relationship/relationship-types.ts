export type RelationshipState = {
  isLoading: boolean | Maybe;
  friends: unknown[];
};

export type AddFriendProps = {
  username: string;
  discriminator: string;
};
