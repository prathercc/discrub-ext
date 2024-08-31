import { useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DateTimePicker from "../../../common-components/date-time-picker/date-time-picker";
import {
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FilledInput,
} from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import CopyAdornment from "../../../components/copy-adornment";
import ClearIcon from "@mui/icons-material/Clear";
import { sortByProperty } from "../../../utils";
import { Filter } from "../../../features/message/message-types";
import { FilterName } from "../../../enum/filter-name";
import { FilterType } from "../../../enum/filter-type";
import Channel from "../../../classes/channel";
import MultiValueSelect from "../../../common-components/multi-value-select/multi-value-select";
import { MessageType } from "../../../enum/message-type";

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
  const [inverse, setInverse] = useState(0);
  const [messageTypes, setMessageTypes] = useState<string[]>([]);
  const [messageTags, setMessageTags] = useState<string[]>([]);
  const [attachmentTags, setAttachmentTags] = useState<string[]>([]);
  const [userNameTags, setUserNameTags] = useState<string[]>([]);

  return (
    <Stack
      zIndex={1}
      sx={{ width: "100%" }}
      spacing={1}
      direction="column"
      mt={1}
    >
      <Tooltip
        title="Inverse Filter"
        description="Show messages NOT matching the other provided Quick Filters"
        placement="left"
      >
        <FormControl fullWidth>
          <InputLabel variant="filled">Inverse</InputLabel>
          <Select
            input={<FilledInput size="small" />}
            value={inverse}
            label="Inverse"
            onChange={(e) => {
              const { value } = e.target;
              const parsedValue =
                typeof value === "number" ? value : Number.parseInt(value);
              handleFilterUpdate({
                filterName: FilterName.INVERSE,
                filterValue: !!parsedValue,
                filterType: FilterType.TOGGLE,
              });
              setInverse(parsedValue);
            }}
          >
            <MenuItem value={0}>No</MenuItem>
            <MenuItem value={1}>Yes</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>

      <MultiValueSelect
        label="Message Types"
        onChange={(values) => {
          handleFilterUpdate({
            filterName: FilterName.MESSAGE_TYPE,
            filterValue: values,
            filterType: FilterType.ARRAY,
          });
          setMessageTypes(values);
        }}
        value={messageTypes}
        values={[MessageType.CALL, MessageType.CHANNEL_PINNED_MESSAGE]}
        displayNameMap={{
          [MessageType.CALL]: "Call",
          [MessageType.CHANNEL_PINNED_MESSAGE]: "Pinned Message",
        }}
      />

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

      <Autocomplete
        multiple
        id="user-name-autocomplete"
        options={[]}
        freeSolo
        fullWidth
        onChange={(_, v) => {
          setUserNameTags(v);
          handleFilterUpdate({
            filterName: FilterName.USER_NAME,
            filterValue: v,
            filterType: FilterType.TEXT,
          });
        }}
        onInputChange={(_, v) => {
          if (!userNameTags.length) {
            handleFilterUpdate({
              filterName: FilterName.USER_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        value={userNameTags}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip variant="outlined" label={option} key={key} {...tagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="filled"
            label="Username"
            fullWidth
            maxRows={1}
          />
        )}
      />

      <Autocomplete
        multiple
        id="message-content-autocomplete"
        options={[]}
        freeSolo
        fullWidth
        onChange={(_, v) => {
          console.warn(v);
          setMessageTags(v);
          handleFilterUpdate({
            filterName: FilterName.CONTENT,
            filterValue: v,
            filterType: FilterType.TEXT,
          });
        }}
        onInputChange={(_, v) => {
          if (!messageTags.length) {
            handleFilterUpdate({
              filterName: FilterName.CONTENT,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        value={messageTags}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip variant="outlined" label={option} key={key} {...tagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="filled"
            label="Message"
            fullWidth
            maxRows={1}
          />
        )}
      />

      <Autocomplete
        multiple
        id="attachment-name-autocomplete"
        options={[]}
        freeSolo
        fullWidth
        onChange={(_, v) => {
          setAttachmentTags(v);
          handleFilterUpdate({
            filterName: FilterName.ATTACHMENT_NAME,
            filterValue: v,
            filterType: FilterType.TEXT,
          });
        }}
        onInputChange={(_, v) => {
          if (!attachmentTags.length) {
            handleFilterUpdate({
              filterName: FilterName.ATTACHMENT_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        value={attachmentTags}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip variant="outlined" label={option} key={key} {...tagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="filled"
            label="Attachment Name"
            fullWidth
            maxRows={1}
          />
        )}
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
  );
};

export default FilterComponent;
