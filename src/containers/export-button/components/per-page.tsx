import Tooltip from "../../../common-components/tooltip/tooltip";
import TextField from "@mui/material/TextField";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { setSetting } from "../../../services/chrome-service";
import { DiscrubSetting } from "../../../enum/discrub-setting";

const PerPage = () => {
  const { state: appState, setSettings } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const isExporting = exportState.isExporting();
  const messagesPerPage = settings.exportMessagesPerPage;

  const handleOnChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const input = parseInt(e.target.value);
    const settings = await setSetting(
      DiscrubSetting.EXPORT_MESSAGES_PER_PAGE,
      !isNaN(input) ? e.target.value : "1000"
    );
    setSettings(settings);
  };

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
        onChange={handleOnChange}
      />
    </Tooltip>
  );
};

export default PerPage;
