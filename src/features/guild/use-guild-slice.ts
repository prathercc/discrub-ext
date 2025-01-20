import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setGuilds as setGuildsAction,
  setGuild as setGuildAction,
  resetGuild as resetGuildAction,
  setPreFilterUsers as setPreFilterUsersAction,
  getRoles as getRolesAction,
  getGuilds as getGuildsAction,
  changeGuild as changeGuildAction,
  getPreFilterUsers as getPreFilterUsersAction,
} from "./guild-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Guild from "../../classes/guild";
import { PreFilterUser } from "../dm/dm-types";

const useGuildSlice = () => {
  const dispatch = useAppDispatch();

  const useGuilds = (): Guild[] =>
    useAppSelector((state: RootState) => state.guild.guilds);

  const useSelectedGuild = (): Guild | Maybe =>
    useAppSelector((state: RootState) => {
      const { selectedGuild } = state.guild;
      if (selectedGuild) {
        return selectedGuild;
      }
    });

  const usePreFilterUsers = (): PreFilterUser[] =>
    useAppSelector((state: RootState) => state.guild.preFilterUsers);

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.guild.isLoading);

  const state = {
    guilds: useGuilds,
    selectedGuild: useSelectedGuild,
    preFilterUsers: usePreFilterUsers,
    isLoading: useIsLoading,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setGuilds = (guilds: Guild[]) => {
    dispatch(setGuildsAction(guilds));
  };

  const setGuild = (guildId: Snowflake | Maybe) => {
    dispatch(setGuildAction(guildId));
  };

  const resetGuild = () => {
    dispatch(resetGuildAction());
  };

  const setPreFilterUsers = (preFilterUsers: PreFilterUser[]) => {
    dispatch(setPreFilterUsersAction(preFilterUsers));
  };

  const getRoles = (guildId: Snowflake) => {
    dispatch(getRolesAction(guildId));
  };

  const getGuilds = () => {
    dispatch(getGuildsAction());
  };

  const changeGuild = (guildId: Snowflake | Maybe) => {
    dispatch(changeGuildAction(guildId));
  };

  const getPreFilterUsers = (guildId: Snowflake) => {
    dispatch(getPreFilterUsersAction(guildId));
  };

  return {
    state,
    setIsLoading,
    setGuilds,
    setGuild,
    resetGuild,
    setPreFilterUsers,
    getRoles,
    getGuilds,
    changeGuild,
    getPreFilterUsers,
  };
};

export { useGuildSlice };
