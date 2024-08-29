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
    toolTipDescription: "Search messages from after the provided date",
    label: "Messages After",
  },
  beforeProps = {
    toolTipTitle: "Messages Before",
    toolTipDescription: "Search messages from before the provided date",
    label: "Messages Before",
  },
}: BeforeAndAfterFieldsProps) {
  const {
    state: messageState,
    setSearchAfterDate,
    setSearchBeforeDate,
  } = useMessageSlice();
  const searchAfterDate = messageState.searchAfterDate();
  const searchBeforeDate = messageState.searchBeforeDate();

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Tooltip
        arrow
        title={afterProps.toolTipTitle}
        description={afterProps.toolTipDescription}
        placement="left"
      >
        <DateTimePicker
          onDateChange={(e) => setSearchAfterDate(e)}
          label={afterProps.label}
          disabled={disabled}
          value={searchAfterDate}
        />
      </Tooltip>
      <Tooltip
        arrow
        title={beforeProps.toolTipTitle}
        description={beforeProps.toolTipDescription}
        placement="right"
      >
        <DateTimePicker
          onDateChange={(e) => setSearchBeforeDate(e)}
          label={beforeProps.label}
          disabled={disabled}
          value={searchBeforeDate}
        />
      </Tooltip>
    </Stack>
  );
}

export default BeforeAndAfterFields;
