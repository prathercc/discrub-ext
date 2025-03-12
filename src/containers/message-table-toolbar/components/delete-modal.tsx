import { useState, useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SouthIcon from "@mui/icons-material/South";
import Box from "@mui/material/Box";
import ModalAlert from "../../../components/modal-alert.tsx";
import {
  Typography,
  Button,
  Checkbox,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  useTheme,
  LinearProgress,
  Collapse,
  AlertColor,
} from "@mui/material";
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { isMessage, isNonNullable } from "../../../app/guards";
import { DeleteConfiguration } from "../../../features/message/message-types";
import { AppTask } from "../../../features/app/app-types";
import MessageMock from "../../message-mock/message-mock";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import {
  ExportReactionMap,
  ExportUserMap,
} from "../../../features/export/export-types.ts";
import Message from "../../../classes/message.ts";
import { Emoji } from "../../../classes/emoji.ts";
import {
  getEncodedEmoji,
  resolveAvatarUrl,
  resolveEmojiUrl,
} from "../../../utils.ts";
import ReactionStatus from "./reaction-status.tsx";
import {
  MISSING_PERMISSION_SKIPPING,
  MISSING_PERMISSION_TO_MODIFY,
  REACTION_REMOVE_FAILED_FOR,
} from "../../../features/message/contants.ts";

type DeleteModalProps = {
  open: boolean;
  handleClose: () => void;
  handleDeleteMessage: (deleteConfig: DeleteConfiguration) => void;
  selectedRows: string[];
  task: AppTask;
  messages: Message[];
  reactionMap: ExportReactionMap;
  userMap: ExportUserMap;
};

const DeleteModal = ({
  open,
  handleClose,
  selectedRows,
  task,
  handleDeleteMessage,
  messages,
  reactionMap,
  userMap,
}: DeleteModalProps) => {
  const theme = useTheme();
  const { active, entity, statusText } = task;
  const defaultConfig: DeleteConfiguration = {
    attachments: true,
    messages: true,
    reactions: false,
    reactingUserIds: [],
    emojis: [],
  };

  const filteredMessages = messages.filter((m) =>
    selectedRows.some((id) => id === m.id),
  );

  const getEmojisInUse = () => {
    const emojis: Emoji[] = [];
    filteredMessages.forEach((m) => {
      (m.reactions || []).forEach((r) => {
        const alreadyExists = emojis.some(
          (e) => getEncodedEmoji(e) === getEncodedEmoji(r.emoji),
        );
        if (!alreadyExists) {
          emojis.push(r.emoji);
        }
      });
    });

    return emojis;
  };

  const getReactingUserIds = () => {
    const userIds: string[] = [];
    filteredMessages.forEach((m) => {
      const reactionMapping = reactionMap[m.id] || {};
      Object.keys(reactionMapping).forEach((key) => {
        reactionMapping[key].forEach(({ id }) => {
          const alreadyExists = userIds.some((eId) => eId === id);
          if (!alreadyExists) {
            userIds.push(id);
          }
        });
      });
    });
    return userIds;
  };

  const [deleteConfig, setDeleteConfig] =
    useState<DeleteConfiguration>(defaultConfig);

  const [emojisInUse, setEmojisInUse] = useState<Emoji[]>([]);
  const [reactingUserIds, setReactingUserIds] = useState<string[]>([]);

  const incompleteReactionDelete =
    deleteConfig.reactions &&
    (!deleteConfig.reactingUserIds?.length || !deleteConfig.emojis?.length);

  useEffect(() => {
    setDeleteConfig(defaultConfig);
  }, [open]);

  useEffect(() => {
    if (open && selectedRows.length === 0) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedRows]);

  const handleToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
    property: keyof DeleteConfiguration,
  ) => {
    const { checked } = e.target;
    let newState = deleteConfig;
    if (property === "reactions") {
      newState = checked
        ? {
            ...deleteConfig,
            messages: false,
            attachments: false,
            reactions: true,
          }
        : { ...deleteConfig, reactions: false };
      setEmojisInUse(checked ? getEmojisInUse() : []);
      setReactingUserIds(checked ? getReactingUserIds() : []);
    } else {
      newState = checked
        ? { ...deleteConfig, [property]: true, reactions: false }
        : { ...deleteConfig, [property]: false };
    }
    setDeleteConfig(newState);
  };

  const forms: {
    label: string;
    property: keyof Omit<DeleteConfiguration, "reactingUserIds" | "emojis">;
  }[] = [
    { label: "Attachments", property: "attachments" },
    { label: "Messages", property: "messages" },
    { label: "Reactions", property: "reactions" },
  ];

  const alertSeverity: AlertColor =
    statusText &&
    [
      MISSING_PERMISSION_SKIPPING,
      MISSING_PERMISSION_TO_MODIFY,
      REACTION_REMOVE_FAILED_FOR,
    ].some((msg) => statusText.includes(msg))
      ? "error"
      : "info";

  return (
    <Dialog hideBackdrop fullWidth open={open}>
      <DialogTitle>
        <Typography variant="h5">Delete Data</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          {forms.map(({ label, property }) => (
            <FormControlLabel
              control={
                <Checkbox
                  color="secondary"
                  disabled={active}
                  checked={deleteConfig[property]}
                  onChange={(e) => handleToggle(e, property)}
                />
              }
              label={label}
            />
          ))}

          <Collapse
            sx={{ maxHeight: "45px", mb: 1 }}
            orientation="vertical"
            in={deleteConfig.reactions}
          >
            <Box display="flex" gap={1}>
              <EnhancedAutocomplete
                disabled={active}
                label="Reactions From"
                options={reactingUserIds}
                value={deleteConfig.reactingUserIds}
                multiple
                onSelectAll={() => {
                  const isSelectAll =
                    deleteConfig.reactingUserIds.length !==
                    reactingUserIds.length;
                  if (isSelectAll) {
                    setDeleteConfig({
                      ...deleteConfig,
                      reactingUserIds: reactingUserIds,
                    });
                  } else {
                    setDeleteConfig({ ...deleteConfig, reactingUserIds: [] });
                  }
                }}
                getOptionLabel={(e) => userMap[e]?.userName || e}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setDeleteConfig({
                      ...deleteConfig,
                      reactingUserIds: value,
                    });
                  }
                }}
                getOptionIconSrc={(e) => {
                  const mapping = userMap[e];
                  return resolveAvatarUrl(e, mapping.avatar)?.remote;
                }}
              />
              <EnhancedAutocomplete
                disabled={active}
                label="Emojis"
                options={emojisInUse
                  .map((e) => getEncodedEmoji(e))
                  .filter(isNonNullable)}
                value={deleteConfig.emojis}
                multiple
                onSelectAll={() => {
                  const isSelectAll =
                    deleteConfig.emojis.length !== emojisInUse.length;
                  if (isSelectAll) {
                    setDeleteConfig({
                      ...deleteConfig,
                      emojis: emojisInUse
                        .map((e) => getEncodedEmoji(e))
                        .filter(isNonNullable),
                    });
                  } else {
                    setDeleteConfig({ ...deleteConfig, emojis: [] });
                  }
                }}
                getOptionLabel={(e) => {
                  const emoji = emojisInUse.find(
                    (emoji) => getEncodedEmoji(emoji) === e,
                  );
                  return emoji?.name || e;
                }}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setDeleteConfig({ ...deleteConfig, emojis: value });
                  }
                }}
                getOptionIconSrc={(e) => {
                  const emoji = emojisInUse.find(
                    (e1) => getEncodedEmoji(e1) === e,
                  );
                  return emoji?.id
                    ? resolveEmojiUrl(emoji.id)?.remote
                    : undefined;
                }}
              />
            </Box>
          </Collapse>

          {active && isMessage(entity) && (
            <>
              <Box
                my={1}
                sx={{
                  minHeight: "50px",
                  maxHeight: "50px",
                  overflowX: "hidden",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <MessageMock browserView index={entity.id} message={entity} />
              </Box>
              <Stack
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                gap="5px"
                width="100%"
              >
                <LinearProgress sx={{ width: "100%" }} />
                <SouthIcon />
                {deleteConfig.reactions && (
                  <ReactionStatus
                    emojisInUse={emojisInUse}
                    entity={entity}
                    userMap={userMap}
                  />
                )}
                {!deleteConfig.reactions && (
                  <DeleteSweepIcon sx={{ color: theme.palette.error.main }} />
                )}
              </Stack>
              <ModalAlert severity={alertSeverity} debugMessage={statusText} />
              <Typography sx={{ display: "block" }} variant="caption">
                {`Message ${entity._index} of ${entity._total}`}
              </Typography>
            </>
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleClose} />
        <PauseButton disabled={!active} />
        <Button
          variant="contained"
          disabled={active || incompleteReactionDelete}
          onClick={() => handleDeleteMessage(deleteConfig)}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteModal;
