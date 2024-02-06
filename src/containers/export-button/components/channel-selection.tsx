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
} from "@mui/material";
import Channel from "../../../classes/channel";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";

type ChannelSelectionProps = {
  selectedExportChannels: Snowflake[];
  channels: Channel[];
  handleChannelSelect: (id: Snowflake) => void;
};

const ChannelSelection = ({
  selectedExportChannels,
  channels,
  handleChannelSelect,
}: ChannelSelectionProps) => {
  const [filterValue, setFilterValue] = useState<string>("");

  const filteredChannels = filterValue
    ? channels.filter((c) => c.name && c.name.includes(filterValue))
    : channels;

  return (
    <>
      <Box sx={{ width: 350, height: 200, overflow: "auto" }}>
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
    </>
  );
};

export default ChannelSelection;
