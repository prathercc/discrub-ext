import { Stack } from "@mui/material";
import Tooltip from "../common-components/tooltip/tooltip";
import DateTimePicker from "../common-components/date-time-picker/date-time-picker";
import { useMessageSlice } from "../features/message/use-message-slice";

type FieldProps = {
  toolTipTitle: string;
  toolTipDescription: string;
  label: string;
};

type BeforeAndAfterFieldsProps = {
  disabled: boolean;
  afterProps?: FieldProps;
  beforeProps?: FieldProps;
};

function BeforeAndAfterFields({
  disabled,
  afterProps = {
    toolTipTitle: "Messages After",
    toolTipDescription: "Messages after the provided date.",
    label: "Messages After",
  },
  beforeProps = {
    toolTipTitle: "Messages Before",
    toolTipDescription: "Messages before the provided date.",
    label: "Messages Before",
  },
}: BeforeAndAfterFieldsProps) {
  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();
  const { searchAfterDate, searchBeforeDate } = searchCriteria;

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Tooltip
        title={afterProps.toolTipTitle}
        description={afterProps.toolTipDescription}
        placement="left"
      >
        <DateTimePicker
          onDateChange={(e) => setSearchCriteria({ searchAfterDate: e })}
          label={afterProps.label}
          disabled={disabled}
          value={searchAfterDate}
        />
      </Tooltip>
      <Tooltip
        title={beforeProps.toolTipTitle}
        description={beforeProps.toolTipDescription}
        placement="right"
      >
        <DateTimePicker
          onDateChange={(e) => setSearchCriteria({ searchBeforeDate: e })}
          label={beforeProps.label}
          disabled={disabled}
          value={searchBeforeDate}
        />
      </Tooltip>
    </Stack>
  );
}

export default BeforeAndAfterFields;
