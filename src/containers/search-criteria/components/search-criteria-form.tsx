import { Stack } from "@mui/material";
import PrefilterUser from "../../../components/prefilter-user";
import BeforeAndAfterFields from "../../../components/before-and-after-fields";
import MessageContains from "./message-contains";
import HasType from "./has-type";

type SearchCriteriaFormProps = {
  isDm: boolean;
};

const SearchCriteriaForm = ({ isDm }: SearchCriteriaFormProps) => {
  return (
    <Stack direction="column" spacing={1}>
      <PrefilterUser isDm={isDm} />
      <BeforeAndAfterFields disabled={false} />
      <MessageContains disabled={false} />
      <HasType disabled={false} />
    </Stack>
  );
};
export default SearchCriteriaForm;
