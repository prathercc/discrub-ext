import { Stack } from "@mui/material";
import PrefilterUser from "../../../components/prefilter-user";
import BeforeAndAfterFields from "../../../components/before-and-after-fields";
import MessageContains from "./message-contains";
import HasType from "./has-type";
import IsPinned from "./is-pinned.tsx";
import MentionedUsers from "./mentioned-users.tsx";

export enum VisibleSearchCriteria {
  SEARCH_BY_USER = "SEARCH_BY_USERS",
  SEARCH_BY_DATE = "SEARCH_BY_DATE",
  SEARCH_BY_MESSAGE = "SEARCH_BY_MESSAGE",
  SEARCH_BY_TYPE = "SEARCH_BY_TYPE",
  SEARCH_BY_PINNED = "SEARCH_BY_PINNED",
  SEARCH_BY_MENTIONS = "SEARCH_BY_MENTIONS",
}

export const defaultCriteria = [
  VisibleSearchCriteria.SEARCH_BY_USER,
  VisibleSearchCriteria.SEARCH_BY_DATE,
  VisibleSearchCriteria.SEARCH_BY_MESSAGE,
  VisibleSearchCriteria.SEARCH_BY_TYPE,
  VisibleSearchCriteria.SEARCH_BY_PINNED,
  VisibleSearchCriteria.SEARCH_BY_MENTIONS,
];

type SearchCriteriaFormProps = {
  isDm: boolean;
  visibleCriteria?: VisibleSearchCriteria[];
};

const SearchCriteriaForm = ({
  isDm,
  visibleCriteria = defaultCriteria,
}: SearchCriteriaFormProps) => {
  return (
    <Stack direction="column" spacing={1}>
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_USER) && (
        <PrefilterUser isDm={isDm} />
      )}
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_DATE) && (
        <BeforeAndAfterFields disabled={false} />
      )}
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_MESSAGE) && (
        <MessageContains disabled={false} />
      )}
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_TYPE) && (
        <HasType disabled={false} />
      )}
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_PINNED) && (
        <IsPinned disabled={false} />
      )}
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_MENTIONS) && (
        <MentionedUsers isDm={isDm} />
      )}
    </Stack>
  );
};
export default SearchCriteriaForm;
