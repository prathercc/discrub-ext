import { useState } from "react";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { format, parseISO } from "date-fns";
import { IconButton, useTheme } from "@mui/material";
import { getColor, getTimeZone } from "../utils";
import Embed from "../classes/embed";
import { useExportSlice } from "../features/export/use-export-slice";
import { EmbedFieldObject } from "../types/embed-field-object";
import Message from "../classes/message";

type WebhookEmbedMockProps = {
  embed: Embed;
  alwaysExpanded?: boolean;
  message: Message;
};

const WebhookEmbedMock = ({
  embed,
  alwaysExpanded = false,
  message,
}: WebhookEmbedMockProps) => {
  const theme = useTheme();

  const { state: exportState, getFormattedInnerHtml } = useExportSlice();
  const mediaMap = exportState.mediaMap();

  const [expanded, setExpanded] = useState(false);

  const getEmbedAuthor = () => {
    const { name, url } = embed.author || {};
    const icon_url =
      mediaMap[String(embed.author?.proxy_icon_url)] ||
      embed.author?.proxy_icon_url;
    return (
      <Box display="flex" alignItems="center" gap="10px">
        {icon_url && (
          <img
            style={{ width: "24px", height: "24px" }}
            src={icon_url}
            alt="author-icon"
          />
        )}
        {url && (
          <a
            style={{
              textDecoration: "none",
            }}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <Typography
              sx={{
                display: "block",
                whiteSpace: "pre-line",
                cursor: "pointer !important",
                color: "rgb(0, 168, 252)",
              }}
              variant="subtitle2"
              dangerouslySetInnerHTML={{
                __html: getFormattedInnerHtml({
                  content: name || "",
                  isReply: false,
                  exportView: alwaysExpanded,
                  message,
                }),
              }}
            />
          </a>
        )}
        {!url && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="subtitle2"
            dangerouslySetInnerHTML={{
              __html: getFormattedInnerHtml({
                content: name || "",
                isReply: false,
                exportView: alwaysExpanded,
                message,
              }),
            }}
          />
        )}
      </Box>
    );
  };

  const getThumbnail = () => {
    const url =
      mediaMap[String(embed.thumbnail?.proxy_url)] ||
      embed.thumbnail?.proxy_url;
    return (
      <>
        {url && (
          <img
            style={{ maxWidth: "80px", maxHeight: "80px" }}
            src={url}
            alt="thumbnail"
          />
        )}
      </>
    );
  };

  const getBodyTitle = () => {
    const { title, url } = embed;
    return (
      <>
        {url && (
          <a
            style={{
              textDecoration: "none",
            }}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <Typography
              sx={{
                display: "block",
                whiteSpace: "pre-line",
                color: "rgb(0, 168, 252)",
                cursor: "pointer !important",
              }}
              dangerouslySetInnerHTML={{
                __html: getFormattedInnerHtml({
                  content: title || "",
                  isReply: false,
                  exportView: alwaysExpanded,
                  message,
                }),
              }}
            />
          </a>
        )}
        {!url && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{
              __html: getFormattedInnerHtml({
                content: title || "",
                isReply: false,
                exportView: alwaysExpanded,
                message,
              }),
            }}
          />
        )}
      </>
    );
  };

  const getBodyDescription = () => {
    const { description } = embed;
    return (
      <Typography
        sx={{ display: "block", whiteSpace: "pre-line" }}
        variant="body2"
        dangerouslySetInnerHTML={{
          __html: getFormattedInnerHtml({
            content: description || "",
            isReply: false,
            exportView: alwaysExpanded,
            message,
          }),
        }}
      />
    );
  };

  const getField = (field: EmbedFieldObject) => {
    const { name, value } = field;
    return (
      <Box mt="15px" display="flex" flexDirection="column">
        {name && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{
              __html: getFormattedInnerHtml({
                content: name,
                isReply: false,
                exportView: alwaysExpanded,
                message,
              }),
            }}
          />
        )}
        {value && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: getFormattedInnerHtml({
                content: value,
                isReply: false,
                exportView: alwaysExpanded,
                message,
              }),
            }}
          />
        )}
        {}
      </Box>
    );
  };

  const getImage = () => {
    const url =
      mediaMap[String(embed.image?.proxy_url)] || embed.image?.proxy_url;
    return (
      <>
        {url && (
          <img
            style={{ marginTop: "15px", maxWidth: "400px", maxHeight: "300px" }}
            src={url}
            alt="embed"
          />
        )}
      </>
    );
  };

  const getFooter = () => {
    const { timestamp, footer } = embed;
    const { text } = footer || {};
    const icon_url =
      mediaMap[String(embed.footer?.proxy_icon_url)] ||
      embed.footer?.proxy_icon_url;

    let parsedDate;
    let formattedDate;
    let tz;

    if (timestamp) {
      parsedDate = parseISO(timestamp);
      tz = getTimeZone(parsedDate);
      formattedDate = `${format(parsedDate, "MM/dd/yyyy")} ${format(
        parsedDate,
        "HH:mm:ss"
      )} ${tz}`;
    }

    return (
      <Box
        mt="15px"
        display="flex"
        alignItems="center"
        flexDirection="row"
        gap="5px"
      >
        {icon_url && (
          <img
            style={{ width: "20px", height: "20px" }}
            src={icon_url}
            alt="footer-icon"
          />
        )}
        {text && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="caption"
            dangerouslySetInnerHTML={{
              __html: getFormattedInnerHtml({
                content: text,
                isReply: false,
                exportView: alwaysExpanded,
                message,
              }),
            }}
          />
        )}
        {timestamp && (
          <Typography variant="caption"> • {formattedDate}</Typography>
        )}
      </Box>
    );
  };

  return (
    <Accordion
      expanded={alwaysExpanded || expanded}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderLeft: `3px solid ${getColor(embed.color || 0)}`,
        marginBottom: alwaysExpanded ? "16px !important" : undefined,
      }}
    >
      <AccordionSummary
        sx={{
          cursor: "default !important",
          "& .Mui-expanded": {
            margin: "0px !important",
            marginTop: "15px !important",
          },
        }}
        expandIcon={
          alwaysExpanded ? null : (
            <IconButton
              onClick={alwaysExpanded ? () => {} : () => setExpanded(!expanded)}
              color="secondary"
            >
              <ExpandMoreIcon />
            </IconButton>
          )
        }
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Box display="flex" flexDirection="column" gap="5px">
            {getEmbedAuthor()}
            {getBodyTitle()}
          </Box>
          {getThumbnail()}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {getBodyDescription()}
        {embed.fields?.map((field) => getField(field))}
        {getImage()}
        {getFooter()}
      </AccordionDetails>
    </Accordion>
  );
};
export default WebhookEmbedMock;
