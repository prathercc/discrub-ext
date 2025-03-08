import Tooltip from "../../../common-components/tooltip/tooltip";
import { useMessageSlice } from "../../../features/message/use-message-slice";
import { HasType as HasTypeEnum } from "../../../enum/has-type";
import MultiValueSelect from "../../../common-components/multi-value-select/multi-value-select";

type HasTypeProps = {
  disabled: boolean;
};

function HasType({ disabled }: HasTypeProps) {
  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();
  const { selectedHasTypes } = searchCriteria;

  return (
    <Tooltip
      title="Messages Containing"
      description="Messages that contain the specified type(s)."
      placement="left"
    >
      <MultiValueSelect
        disabled={disabled}
        label="Messages Containing"
        onChange={(values) =>
          setSearchCriteria({ selectedHasTypes: values as HasTypeEnum[] })
        }
        value={selectedHasTypes}
        values={Object.values(HasTypeEnum)}
      />
    </Tooltip>
  );
}

export default HasType;
