import React, { useContext } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import AttachmentIcon from "@mui/icons-material/Attachment";
import MessageChip from "../../Chips/MessageChip";
import { MessageContext } from "../../../context/message/MessageContext";
import DiscordTableStyles from "./DiscordTable.styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export default function DiscordTableMessage({
  row,
  foundThread,
  openAttachmentModal = () => {},
  openEmbedModal = () => {},
}) {
  const classes = DiscordTableStyles();
  const { setAttachmentMessage, setEmbedMessage } = useContext(MessageContext);
  const hasValidEmbed = row?.embeds?.some((embed) => embed?.type === "rich");

  return (
    <>
      <td className={classes.tdContent} colspan={4}>
        <Grid container>
          <Grid xs={4} item>
            <Grid className={classes.gridAvatar} container>
              <Grid xs={12} item>
                <MessageChip
                  className={classes.messageChip}
                  username={row.username}
                  avatar={`https://cdn.discordapp.com/avatars/${row.author.id}/${row.author.avatar}.png`}
                  content={row.username}
                />
              </Grid>
              <Grid px={1} item xs={12}>
                <Typography className={classes.typography} variant="caption">
                  {new Date(Date.parse(row.timestamp)).toLocaleString("en-US")}
                </Typography>
              </Grid>
              {foundThread && (
                <Grid px={1} item xs={12}>
                  <Tooltip
                    title={`Thread ID: ${foundThread.id}${
                      foundThread.archived ? " (Archived)" : " (Active)"
                    }`}
                  >
                    <Typography
                      variant="caption"
                      className={
                        foundThread.archived
                          ? classes.threadTextArchived
                          : classes.threadText
                      }
                    >
                      {foundThread.name?.slice(0, 20)}
                    </Typography>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid className={classes.gridMessage} item xs={8} px={1}>
            <Typography variant="caption">{row.content}</Typography>
          </Grid>
        </Grid>
      </td>
      <td colspan={1} className={classes.tdAttachment}>
        <Stack direction="column" justifyContent="center" alignItems="center">
          <Tooltip
            placement={hasValidEmbed ? "top" : "bottom"}
            title="Attachments"
          >
            <IconButton
              disabled={row.attachments.length === 0}
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
          {hasValidEmbed && (
            <Tooltip title="Embeds">
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
