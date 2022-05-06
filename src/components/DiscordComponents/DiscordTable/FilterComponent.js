import React from "react";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import DiscordDateTimePicker from "../DiscordDateTimePicker/DiscordDateTimePicker";

const FilterComponent = ({ handleFilterUpdate }) => {
  return (
    <Grid spacing={2} container>
      <Grid xs={12} item>
        <Grid spacing={2} container>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => handleFilterUpdate("startTime", e, "date")}
              label="Start Time"
            />
          </Grid>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => handleFilterUpdate("endTime", e, "date")}
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
          onChange={(e) =>
            handleFilterUpdate("username", e.target.value, "text")
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate("content", e.target.value, "text")
          }
          label="Message"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate("attachmentName", e.target.value, "text")
          }
          label="Attachment Name"
        />
      </Grid>
    </Grid>
  );
};

export default FilterComponent;
