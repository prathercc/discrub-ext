import Tooltip from "../../../common-components/tooltip/tooltip";
import TextField from "@mui/material/TextField";
import { useExportSlice } from "../../../features/export/use-export-slice";

const PerPage = () => {
  const { state: exportState, setMessagesPerPage } = useExportSlice();
  const isExporting = exportState.isExporting();
  const messagesPerPage = exportState.messagesPerPage();

  return (
    <Tooltip
      arrow
      placement="top"
      title={"Messages Per Page"}
      description="Consider keeping this value low, export times can be completed many times faster if messages are broken up into pages."
    >
      <TextField
        label="Messages Per Page"
        variant="filled"
        size="small"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        disabled={isExporting}
        value={messagesPerPage}
        onChange={(e) => {
          const input = parseInt(e.target.value);
          if (!isNaN(input)) setMessagesPerPage(input);
          else setMessagesPerPage(1000);
        }}
      />
    </Tooltip>
  );
};

export default PerPage;
