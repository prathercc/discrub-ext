import React, { useContext } from "react";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import DiscordDateTimePicker from "../DiscordDateTimePicker/DiscordDateTimePicker";
import { MessageContext } from "../../../context/message/MessageContext";

const FilterComponent = () => {
  const { updateFilters } = useContext(MessageContext);

  return (
    <Grid spacing={2} container>
      <Grid xs={12} item>
        <Grid spacing={2} container>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => updateFilters("startTime", e, "date")}
              label="Start Time"
            />
          </Grid>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => updateFilters("endTime", e, "date")}
              label="End Time"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          variant="filled"
          label="Username"
          onChange={(e) => updateFilters("username", e.target.value, "text")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          variant="filled"
          onChange={(e) => updateFilters("content", e.target.value, "text")}
          label="Message"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          variant="filled"
          onChange={(e) =>
            updateFilters("attachmentName", e.target.value, "text")
          }
          label="Attachment Name"
        />
      </Grid>
    </Grid>
  );
};

export default FilterComponent;
