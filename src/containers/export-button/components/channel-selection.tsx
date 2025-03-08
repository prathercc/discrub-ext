import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Box,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import Channel from "../../../classes/channel";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";
import Tooltip from "../../../common-components/tooltip/tooltip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";

type ChannelSelectionProps = {
  selectedExportChannels: Snowflake[];
  channels: Channel[];
  handleChannelSelect: (id: Snowflake) => void;
  onSelectAll: (channels: Channel[]) => void;
};

const ChannelSelection = ({
  selectedExportChannels,
  channels,
  handleChannelSelect,
  onSelectAll,
}: ChannelSelectionProps) => {
  const [filterValue, setFilterValue] = useState<string>("");

  const filteredChannels = filterValue
    ? channels.filter((c) => c.name && c.name.includes(filterValue))
    : channels;

  return (
    <Stack
      sx={{ width: "100%" }}
      direction="column"
      spacing={3}
      justifyContent="space-between"
    >
      <Box sx={{ maxHeight: "250px", overflow: "auto" }}>
        <List disablePadding dense>
          {filteredChannels.map((channel) => (
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
                      (cId) => cId === channel.id,
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

      <Stack direction="row" spacing={3}>
        <Tooltip
          title={selectedExportChannels.length ? "Deselect All" : "Select All"}
        >
          <IconButton
            onClick={() => onSelectAll(filteredChannels)}
            color={selectedExportChannels.length ? "secondary" : "primary"}
          >
            {selectedExportChannels.length ? (
              <DeselectIcon />
            ) : (
              <SelectAllIcon />
            )}
          </IconButton>
        </Tooltip>
        <TextField
          variant="filled"
          fullWidth
          size="small"
          label="Filter Channels"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  setFilterValue("");
                }}
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
};

export default ChannelSelection;
