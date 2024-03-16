import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "../common-components/tooltip/tooltip";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageMock from "../containers/message-mock/message-mock";
import Message from "../classes/message";
import { EmbedType } from "../enum/embed-type";
import { TableCell } from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { AppSettings } from "../features/app/app-types";
import { stringToBool } from "../utils";

type TableMessageProps = {
  settings: AppSettings;
  row: Message;
  openReactionModal?: () => void;
  openAttachmentModal?: () => void;
  openEmbedModal?: () => void;
  setModifyEntity: (row: Message) => void;
};

export default function TableMessage({
  settings,
  row,
  openReactionModal = () => {},
  openAttachmentModal = () => {},
  openEmbedModal = () => {},
  setModifyEntity,
}: TableMessageProps) {
  const hasValidEmbed = row?.embeds?.some(
    (embed) => embed?.type === EmbedType.RICH
  );
  const hasAttachments = row.attachments.length > 0;
  const hasReactions =
    !!row.reactions?.length && stringToBool(settings.reactionsEnabled);

  return (
    <TableCell colSpan={5}>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <MessageMock browserView message={row} index={row.id} />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          {hasReactions && (
            <Tooltip
              arrow
              placement={hasAttachments || hasValidEmbed ? "top" : "bottom"}
              title="Reactions"
            >
              <IconButton
                onClick={async (e) => {
                  e.stopPropagation();
                  setModifyEntity(row);
                  openReactionModal();
                }}
                color="secondary"
              >
                <EmojiEmotionsIcon />
              </IconButton>
            </Tooltip>
          )}
          {hasAttachments && (
            <Tooltip
              arrow
              placement={hasValidEmbed ? "top" : "bottom"}
              title="Attachments"
            >
              <IconButton
                onClick={async (e) => {
                  e.stopPropagation();
                  setModifyEntity(row);
                  openAttachmentModal();
                }}
                color="secondary"
              >
                <AttachmentIcon />
              </IconButton>
            </Tooltip>
          )}
          {hasValidEmbed && (
            <Tooltip arrow title="Embeds">
              <IconButton
                onClick={async (e) => {
                  e.stopPropagation();
                  setModifyEntity(row);
                  openEmbedModal();
                }}
                color="secondary"
              >
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </TableCell>
  );
}
