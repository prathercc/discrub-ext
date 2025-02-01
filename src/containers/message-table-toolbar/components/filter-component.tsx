import { useState } from "react";
import Stack from "@mui/material/Stack";
import DateTimePicker from "../../../common-components/date-time-picker/date-time-picker";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FilledInput,
} from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import { sortByProperty } from "../../../utils";
import { Filter } from "../../../features/message/message-types";
import { FilterName } from "../../../enum/filter-name";
import { FilterType } from "../../../enum/filter-type";
import Channel from "../../../classes/channel";
import MultiValueSelect from "../../../common-components/multi-value-select/multi-value-select";
import { MessageType } from "../../../enum/message-type";
import { MessageCategory } from "../../../enum/message-category";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";

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
        "name",
      ),
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
        label="Message Type/Category"
        onChange={(values) => {
          handleFilterUpdate({
            filterName: FilterName.MESSAGE_TYPE,
            filterValue: values,
            filterType: FilterType.ARRAY,
          });
          setMessageTypes(values);
        }}
        value={messageTypes}
        values={[
          MessageType.CALL,
          MessageCategory.PINNED,
          MessageType.CHANNEL_PINNED_MESSAGE,
          MessageCategory.REACTIONS,
          MessageCategory.THREAD,
          MessageCategory.THREAD_STARTER,
        ]}
        displayNameMap={{
          [MessageType.CALL]: "Call",
          [MessageType.CHANNEL_PINNED_MESSAGE]: "Pin Notification",
          [MessageCategory.PINNED]: "Pinned",
          [MessageCategory.REACTIONS]: "Reactions",
          [MessageCategory.THREAD]: "Thread",
          [MessageCategory.THREAD_STARTER]: "Thread Starter",
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

      <EnhancedAutocomplete
        label="Username"
        options={[]}
        onChange={(v) => {
          if (Array.isArray(v)) {
            setUserNameTags(v);
            handleFilterUpdate({
              filterName: FilterName.USER_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        onInputChange={(v) => {
          if (!userNameTags.length) {
            handleFilterUpdate({
              filterName: FilterName.USER_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        value={userNameTags}
        tags
        multiple
        freeSolo
      />

      <EnhancedAutocomplete
        label="Message Content"
        options={[]}
        multiple
        freeSolo
        tags
        value={messageTags}
        onChange={(v) => {
          if (Array.isArray(v)) {
            setMessageTags(v);
            handleFilterUpdate({
              filterName: FilterName.CONTENT,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        onInputChange={(v) => {
          if (!messageTags.length) {
            handleFilterUpdate({
              filterName: FilterName.CONTENT,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
      />

      <EnhancedAutocomplete
        label="Attachment Name"
        options={[]}
        multiple
        freeSolo
        tags
        value={attachmentTags}
        onChange={(v) => {
          if (Array.isArray(v)) {
            setAttachmentTags(v);
            handleFilterUpdate({
              filterName: FilterName.ATTACHMENT_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
        onInputChange={(v) => {
          if (!attachmentTags.length) {
            handleFilterUpdate({
              filterName: FilterName.ATTACHMENT_NAME,
              filterValue: v,
              filterType: FilterType.TEXT,
            });
          }
        }}
      />

      {!isDm && (
        <EnhancedAutocomplete
          label="Threads"
          options={sortedThreads.map((t) => t.id)}
          getOptionLabel={(id) =>
            String(threads.find((t) => t.id === id)?.name)
          }
          copyName="Thread List"
          copyValue={threads.map((t) => String(t.name)).join("\r\n")}
          onChange={(v) => {
            if (!Array.isArray(v)) {
              handleFilterUpdate({
                filterValue: v,
                filterType: FilterType.THREAD,
              });
            }
          }}
        />
      )}
    </Stack>
  );
};

export default FilterComponent;
