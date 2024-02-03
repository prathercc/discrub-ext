import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "../common-components/tooltip/tooltip";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageMock from "./message-mock";
import Message from "../classes/message";
import { EmbedType } from "../enum/embed-type";
import { TableCell } from "@mui/material";

type TableMessageProps = {
  row: Message;
  openAttachmentModal?: () => void;
  openEmbedModal?: () => void;
  setModifyEntity: (row: Message) => void;
};

export default function TableMessage({
  row,
  openAttachmentModal = () => {},
  openEmbedModal = () => {},
  setModifyEntity,
}: TableMessageProps) {
  const hasValidEmbed = row?.embeds?.some(
    (embed) => embed?.type === EmbedType.RICH
  );

  return (
    <TableCell colSpan={5}>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <MessageMock browserView message={row} index={row.id} />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          {row.attachments.length > 0 && (
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
