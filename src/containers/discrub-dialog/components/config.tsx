import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { setSetting } from "../../../services/chrome-service";
import { AppSettings } from "../../../features/app/app-types";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import Tooltip from "../../../common-components/tooltip/tooltip";
import { SortDirection } from "../../../enum/sort-direction";
import BrushIcon from "@mui/icons-material/Brush";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import ImageIcon from "@mui/icons-material/Image";
import HideImageIcon from "@mui/icons-material/HideImage";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import FormatListNumberedRtlIcon from "@mui/icons-material/FormatListNumberedRtl";
import { stringToBool } from "../../../utils";

type ConfigProps = {
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  visibleSettings: DiscrubSetting[];
};

function Config({
  settings,
  onChangeSettings,
  visibleSettings = [],
}: ConfigProps) {
  const handleChange = async (setting: DiscrubSetting, value: string) => {
    const settings = await setSetting(setting, value);
    onChangeSettings(settings);
  };

  const getValue = (setting: DiscrubSetting) => {
    return settings[setting] || null;
  };

  const controls = [
    // Discrub Settings
    {
      name: DiscrubSetting.REACTIONS_ENABLED,
      label: "Fetch Reaction Data",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "This setting dictates if the extension will lookup reactions for messages.",
    },
    {
      name: DiscrubSetting.SERVER_NICKNAME_LOOKUP,
      label: "Lookup Server Nicknames & Roles",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "This setting determines if a User's server nickname and roles will be looked up during message allocation.",
    },
    {
      name: DiscrubSetting.DISPLAY_NAME_LOOKUP,
      label: "Lookup Display Names",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "Having this setting set to 'Yes' will ensure that User mentions are correctly displayed, even if the mentioned User is not apart of the conversation. It is recommended to keep this setting enabled.",
    },
    // Export Settings
    {
      name: DiscrubSetting.EXPORT_MESSAGES_PER_PAGE,
      label: "Messages Per Page",
      description:
        "Consider keeping this value low, export times can be completed many times faster if messages are broken up into pages.",
      numeric: true,
      fallbackValue: "1000",
      icon: () => <FormatListNumberedRtlIcon />,
    },
    {
      name: DiscrubSetting.EXPORT_DOWNLOAD_MEDIA,
      label: "Download Media",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "Exports may be performed more slowly when downloading media.",
      icon: () =>
        stringToBool(settings.exportDownloadMedia) ? (
          <DownloadIcon />
        ) : (
          <FileDownloadOffIcon />
        ),
    },
    {
      name: DiscrubSetting.EXPORT_PREVIEW_MEDIA,
      label: "Preview Media",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "Previewing Media on a large number of messages can negatively affect the speed of the export.",
      icon: () =>
        stringToBool(settings.exportPreviewMedia) ? (
          <ImageIcon />
        ) : (
          <HideImageIcon />
        ),
    },
    {
      name: DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
      label: "Separate Thread/Forum Posts",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "Separating Threads & Forum Posts will store any existing threads or forum posts into separate files for better readability.",
      icon: () =>
        stringToBool(settings.exportSeparateThreadAndForumPosts) ? (
          <FolderIcon />
        ) : (
          <FolderOffIcon />
        ),
    },
    {
      name: DiscrubSetting.EXPORT_ARTIST_MODE,
      label: "Use Artist Mode",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
      description:
        "Artist Mode will store Attached & Embedded Media into folders named by their Author's username",
      icon: () =>
        stringToBool(settings.exportUseArtistMode) ? (
          <BrushIcon />
        ) : (
          <FormatColorResetIcon />
        ),
    },
    {
      name: DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER,
      label: "Message Sort Direction",
      options: [
        { value: SortDirection.ASCENDING, name: "Ascending" },
        { value: SortDirection.DESCENDING, name: "Descending" },
      ],
      description: `Messages will be sorted by their date, ${
        getValue(DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER) ===
        SortDirection.ASCENDING
          ? "older"
          : "newer"
      } messages at the top.`,
      icon: () =>
        getValue(DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER) ===
        SortDirection.ASCENDING ? (
          <VerticalAlignTopIcon />
        ) : (
          <VerticalAlignBottomIcon />
        ),
    },
  ].filter((control) => visibleSettings.some((hs) => hs === control.name));

  const handleNumericOnChange = async (
    setting: DiscrubSetting,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { fallbackValue } = controls.find((c) => c.name === setting) || {};
    const input = parseInt(e.target.value);
    const settings = await setSetting(
      setting,
      !isNaN(input) ? e.target.value : fallbackValue || ""
    );
    onChangeSettings(settings);
  };

  return (
    <Stack sx={{ padding: 3, spacing: 2, gap: "15px" }}>
      {Object.keys(settings).length &&
        controls.map((control) => {
          const Icon = control.icon?.();
          return (
            <Tooltip placement="left" title={control.description}>
              <FormControl fullWidth>
                {control.numeric && (
                  <TextField
                    label={control.label}
                    variant="filled"
                    size="small"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    value={getValue(control.name)}
                    onChange={(e) => handleNumericOnChange(control.name, e)}
                    InputProps={{ endAdornment: Icon }}
                  />
                )}
                {control.options?.length && (
                  <>
                    <InputLabel>{control.label}</InputLabel>
                    <Select
                      endAdornment={Icon}
                      IconComponent={Icon ? "span" : undefined}
                      value={getValue(control.name)}
                      label={control.label}
                      onChange={(e) => {
                        if (
                          e.target.value !== null &&
                          e.target.value !== undefined
                        )
                          handleChange(control.name, e.target.value);
                      }}
                    >
                      {control.options.map((option) => {
                        return (
                          <MenuItem value={option.value}>
                            {option.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </>
                )}
              </FormControl>
            </Tooltip>
          );
        })}
    </Stack>
  );
}

export default Config;
