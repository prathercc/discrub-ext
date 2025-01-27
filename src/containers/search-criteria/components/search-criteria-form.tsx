import { Stack } from "@mui/material";
import PrefilterUser from "../../../components/prefilter-user";
import BeforeAndAfterFields from "../../../components/before-and-after-fields";
import MessageContains from "./message-contains";
import HasType from "./has-type";
import IsPinned from "./is-pinned.tsx";

export enum VisibleSearchCriteria {
  SEARCH_BY_USER = "PREFILTER_USERS",
  SEARCH_BY_DATE = "SEARCH_BY_DATE",
  SEARCH_BY_MESSAGE = "SEARCH_BY_MESSAGE",
  SEARCH_BY_TYPE = "SEARCH_BY_TYPE",
  SEARCH_BY_PINNED = "SEARCH_BY_PINNED",
}

export const defaultCriteria = [
  VisibleSearchCriteria.SEARCH_BY_USER,
  VisibleSearchCriteria.SEARCH_BY_DATE,
  VisibleSearchCriteria.SEARCH_BY_MESSAGE,
  VisibleSearchCriteria.SEARCH_BY_TYPE,
  VisibleSearchCriteria.SEARCH_BY_PINNED,
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
    </Stack>
  );
};
export default SearchCriteriaForm;
