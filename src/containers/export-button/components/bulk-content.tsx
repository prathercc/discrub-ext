import {
  DialogContent,
  DialogContentText,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import ImageToggle from "./image-toggle";
import Progress from "./progress";
import PreviewImageToggle from "./preview-image-toggle";
import PerPage from "./per-page";
import SortDirectionToggle from "./sort-direction-toggle";
import Channel from "../../../classes/channel";

type BulkContentProps = {
  isDm?: boolean;
  isExporting: boolean;
  selectedExportChannels: Snowflake[];
  channels: Channel[];
  setSelectedExportChannels: (ids: Snowflake[]) => void;
};

const BulkContent = ({
  isDm = false,
  isExporting,
  selectedExportChannels,
  channels,
  setSelectedExportChannels,
}: BulkContentProps) => {
  const theme = useTheme();

  const handleChannelSelect = (id: Snowflake) => {
    const isSelected = selectedExportChannels.some((cId) => cId === id);
    if (isSelected) {
      setSelectedExportChannels([
        ...selectedExportChannels.filter((cId) => cId !== id),
      ]);
    } else {
      setSelectedExportChannels([...selectedExportChannels, id]);
    }
  };

  const toggleSelectAll = () => {
    setSelectedExportChannels(
      selectedExportChannels.length ? [] : channels.map((c) => c.id)
    );
  };

  return (
    <DialogContent>
      {!isExporting && !isDm && (
        <>
          <DialogContentText>
            <Typography variant="body2">Select Channel(s) to export</Typography>
          </DialogContentText>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={3}
          >
            <Box sx={{ width: 350, height: 200, overflow: "auto" }}>
              <List disablePadding dense>
                {channels.map((channel) => (
                  <ListItem key={channel.id} value={channel.id} dense>
                    <ListItemButton
                      role={undefined}
                      onClick={() => handleChannelSelect(channel.id)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          size="small"
                          edge="start"
                          checked={selectedExportChannels.some(
                            (cId) => cId === channel.id
                          )}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={channel.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Tooltip
                arrow
                title={
                  selectedExportChannels.length ? "Deselect All" : "Select All"
                }
              >
                <IconButton
                  onClick={toggleSelectAll}
                  color={
                    selectedExportChannels.length ? "secondary" : "primary"
                  }
                >
                  {selectedExportChannels.length ? (
                    <DeselectIcon />
                  ) : (
                    <SelectAllIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Stack
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "15px",
                  padding: "5px",
                }}
                direction="column"
                justifyContent="flex-end"
                spacing={1}
                alignItems="center"
              >
                <Typography variant="body2">Export Options</Typography>
                <Stack sx={{ width: "100%" }} direction="row" spacing={1}>
                  <SortDirectionToggle />
                  <PreviewImageToggle />
                  <ImageToggle />
                </Stack>
              </Stack>
            </Stack>
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <PerPage />
            </Stack>
          </Stack>
        </>
      )}
      {!isExporting && isDm && (
        <>
          <DialogContentText>
            <Typography variant="body2">Exporting DM</Typography>
          </DialogContentText>
          <Stack direction="row" justifyContent="flex-end" mt={1} mb={1}>
            <Stack
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: "15px",
                padding: "5px",
              }}
              direction="column"
              spacing={1}
              alignItems="center"
            >
              <Typography variant="body2">Export Options</Typography>
              <Stack sx={{ width: "100%" }} direction="row" spacing={1}>
                <SortDirectionToggle />
                <PreviewImageToggle />
                <ImageToggle />
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <PerPage />
          </Stack>
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default BulkContent;
