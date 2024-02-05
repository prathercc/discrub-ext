import { useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DateTimePicker from "../../../common-components/date-time-picker/date-time-picker";
import {
  Autocomplete,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import CopyAdornment from "../../../components/copy-adornment";
import ClearIcon from "@mui/icons-material/Clear";
import { sortByProperty } from "../../../utils";
import { Filter } from "../../../features/message/message-types";
import { FilterName } from "../../../enum/filter-name";
import { FilterType } from "../../../enum/filter-type";
import Channel from "../../../classes/channel";

type FilterComponentProps = {
  isDm: boolean;
  handleFilterUpdate: (filter: Filter) => void;
  threads: Channel[];
};

const FilterComponent = ({
  isDm,
  handleFilterUpdate,
  threads,
}: FilterComponentProps) => {
  const sortedThreads = threads
    .map((t) => new Channel({ ...t }))
    .sort((a, b) =>
      sortByProperty(
        { name: a.name?.toLowerCase() },
        { name: b.name?.toLowerCase() },
        "name"
      )
    );

  const [startTime, setStartTime] = useState<Date | Maybe>(null);
  const [endTime, setEndTime] = useState<Date | Maybe>(null);
  const [inverse, setInverse] = useState(false);

  return (
    <Stack zIndex={1} sx={{ width: "100%" }} spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <DateTimePicker
          onDateChange={(e) => {
            handleFilterUpdate({
              filterName: FilterName.START_TIME,
              filterValue: e,
              filterType: FilterType.DATE,
            });
            setStartTime(e);
          }}
          label="Start Time"
          value={startTime}
        />
        <DateTimePicker
          onDateChange={(e) => {
            handleFilterUpdate({
              filterName: FilterName.END_TIME,
              filterValue: e,
              filterType: FilterType.DATE,
            });
            setEndTime(e);
          }}
          label="End Time"
          value={endTime}
        />
        <Tooltip
          title="Inverse Filter"
          description="Show messages NOT matching the other provided Quick Filters"
        >
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={inverse}
                  onChange={(e) => {
                    handleFilterUpdate({
                      filterName: FilterName.INVERSE,
                      filterValue: e.target.checked,
                      filterType: FilterType.TOGGLE,
                    });
                    setInverse(e.target.checked);
                  }}
                />
              }
              label="Inverse"
            />
          </FormGroup>
        </Tooltip>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <TextField
          size="small"
          fullWidth
          variant="filled"
          label="Username"
          onChange={(e) =>
            handleFilterUpdate({
              filterName: "userName",
              filterValue: e.target.value,
              filterType: FilterType.TEXT,
            })
          }
        />
        <TextField
          size="small"
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate({
              filterName: FilterName.CONTENT,
              filterValue: e.target.value,
              filterType: FilterType.TEXT,
            })
          }
          label="Message"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <TextField
          size="small"
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate({
              filterName: FilterName.ATTACHMENT_NAME,
              filterValue: e.target.value,
              filterType: FilterType.TEXT,
            })
          }
          label="Attachment Name"
        />
        {!isDm && (
          <Autocomplete
            clearIcon={<ClearIcon />}
            onChange={(_, val) =>
              handleFilterUpdate({
                filterValue: val,
                filterType: FilterType.THREAD,
              })
            }
            options={sortedThreads.map((thread) => {
              return thread.id;
            })}
            getOptionLabel={(id) => {
              const foundThread = threads.find((thread) => thread.id === id);
              return String(foundThread?.name);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                fullWidth
                size="small"
                label="Threads"
                sx={{ width: "320px !important" }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <CopyAdornment
                      copyValue={threads
                        .map((thread) => String(thread.name))
                        .join("\r\n")}
                      copyName="Thread List"
                    />
                  ),
                }}
              />
            )}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default FilterComponent;
