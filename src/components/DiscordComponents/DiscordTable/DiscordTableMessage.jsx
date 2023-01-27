import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "../DiscordTooltip/DiscordToolTip";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { MessageContext } from "../../../context/message/MessageContext";
import DiscordTableStyles from "./DiscordTable.styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageMock from "../../Export/MessageMock";

export default function DiscordTableMessage({
  row,
  openAttachmentModal = () => {},
  openEmbedModal = () => {},
}) {
  const classes = DiscordTableStyles();
  const { setAttachmentMessage, setEmbedMessage } = useContext(MessageContext);
  const hasValidEmbed = row?.embeds?.some((embed) => embed?.type === "rich");

  return (
    <>
      <td className={classes.tdContent} colspan={4}>
        <MessageMock hideAttachments row={row} index={row.id} />
      </td>
      <td colspan={1} className={classes.tdAttachment}>
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
                  await setAttachmentMessage(row);
                  openAttachmentModal();
                }}
                color="primary"
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
                  await setEmbedMessage(row);
                  openEmbedModal();
                }}
                color="primary"
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
