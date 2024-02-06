import { User } from "../../classes/user";

export type UserState = {
  currentUser: User | Maybe;
  token: string | Maybe;
  isLoading: boolean | Maybe;
};
