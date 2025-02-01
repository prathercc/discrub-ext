import SearchCriteriaButton from "./components/search-criteria-button.tsx";
import SearchCriteriaForm from "./components/search-criteria-form.tsx";

export enum SearchCriteriaComponentType {
  Button = "button",
  Form = "form",
}

export enum VisibleSearchCriteria {
  SEARCH_BY_USER = "SEARCH_BY_USERS",
  SEARCH_BY_DATE = "SEARCH_BY_DATE",
  SEARCH_BY_MESSAGE = "SEARCH_BY_MESSAGE",
  SEARCH_BY_TYPE = "SEARCH_BY_TYPE",
  SEARCH_BY_PINNED = "SEARCH_BY_PINNED",
  SEARCH_BY_MENTIONS = "SEARCH_BY_MENTIONS",
  SEARCH_BY_CHANNELS = "SEARCH_BY_CHANNELS",
}

export const defaultCriteria = [
  VisibleSearchCriteria.SEARCH_BY_USER,
  VisibleSearchCriteria.SEARCH_BY_DATE,
  VisibleSearchCriteria.SEARCH_BY_MESSAGE,
  VisibleSearchCriteria.SEARCH_BY_TYPE,
  VisibleSearchCriteria.SEARCH_BY_PINNED,
  VisibleSearchCriteria.SEARCH_BY_MENTIONS,
];

export const purgeCriteria = [
  ...defaultCriteria,
  VisibleSearchCriteria.SEARCH_BY_CHANNELS,
];

type SearchCriteriaProps = {
  isDm?: boolean;
  componentType: SearchCriteriaComponentType;
  visibleCriteria?: VisibleSearchCriteria[];
};

function SearchCriteria({
  isDm = false,
  componentType,
  visibleCriteria = defaultCriteria,
}: SearchCriteriaProps) {
  return (
    <>
      {componentType === SearchCriteriaComponentType.Button && (
        <SearchCriteriaButton visibleCriteria={visibleCriteria} isDm={isDm} />
      )}
      {componentType === SearchCriteriaComponentType.Form && (
        <SearchCriteriaForm visibleCriteria={visibleCriteria} isDm={isDm} />
      )}
    </>
  );
}

export default SearchCriteria;
