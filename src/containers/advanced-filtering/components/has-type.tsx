import Tooltip from "../../../common-components/tooltip/tooltip";
import { useMessageSlice } from "../../../features/message/use-message-slice";
import { HasType as HasTypeEnum } from "../../../enum/has-type";
import MultiValueSelect from "../../../common-components/multi-value-select/multi-value-select";

type HasTypeProps = {
  disabled: boolean;
};

function HasType({ disabled }: HasTypeProps) {
  const { state: messageState, setSelectedHasTypes } = useMessageSlice();
  const selectedHasTypes = messageState.selectedHasTypes();

  return (
    <Tooltip
      arrow
      title="Messages Containing"
      description="Search messages that contain the following type(s)"
      placement="left"
    >
      <MultiValueSelect
        disabled={disabled}
        label="Messages Containing"
        onChange={(values) => setSelectedHasTypes(values as HasTypeEnum[])}
        value={selectedHasTypes}
        values={Object.values(HasTypeEnum)}
      />
    </Tooltip>
  );
}

export default HasType;
