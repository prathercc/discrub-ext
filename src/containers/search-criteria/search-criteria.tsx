import SearchCriteriaButton from "./components/search-criteria-button.tsx";
import SearchCriteriaForm from "./components/search-criteria-form.tsx";

export enum SearchCriteriaComponentType {
  Button = "button",
  Form = "form",
}

type SearchCriteriaProps = {
  isDm?: boolean;
  componentType: SearchCriteriaComponentType;
};

function SearchCriteria({ isDm = false, componentType }: SearchCriteriaProps) {
  return (
    <>
      {componentType === SearchCriteriaComponentType.Button && (
        <SearchCriteriaButton isDm={isDm} />
      )}
      {componentType === SearchCriteriaComponentType.Form && (
        <SearchCriteriaForm isDm={isDm} />
      )}
    </>
  );
}

export default SearchCriteria;
