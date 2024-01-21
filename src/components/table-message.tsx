import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "../common-components/tooltip/tooltip";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageMock from "./message-mock";
import Message from "../classes/message";
import { EmbedType } from "../enum/embed-type";

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
    <>
      <td
        style={{
          textAlign: "left",
          verticalAlign: "middle",
          borderBottom: "1px solid rgba(79,84,92,0.48)",
          paddingTop: "5px",
          paddingLeft: "5px",
        }}
        colSpan={4}
      >
        <MessageMock browserView message={row} index={row.id} />
      </td>
      <td
        colSpan={1}
        style={{
          textAlign: "center",
          verticalAlign: "middle",
          borderBottom: "1px solid rgba(79,84,92,0.48)",
        }}
      >
        <Stack direction="column" justifyContent="center" alignItems="center">
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
      </td>
    </>
  );
}
