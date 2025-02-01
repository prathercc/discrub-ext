import { Stack } from "@mui/material";
import PrefilterUser from "../../../components/prefilter-user";
import BeforeAndAfterFields from "../../../components/before-and-after-fields";
import MessageContains from "./message-contains";
import HasType from "./has-type";
import IsPinned from "./is-pinned.tsx";
import MentionedUsers from "./mentioned-users.tsx";
import SearchChannels from "./search-channels.tsx";
import { VisibleSearchCriteria } from "../search-criteria.tsx";

type SearchCriteriaFormProps = {
  isDm: boolean;
  visibleCriteria: VisibleSearchCriteria[];
};

const SearchCriteriaForm = ({
  isDm,
  visibleCriteria,
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
      {visibleCriteria.includes(VisibleSearchCriteria.SEARCH_BY_CHANNELS) &&
        !isDm && <SearchChannels />}
    </Stack>
  );
};
export default SearchCriteriaForm;
