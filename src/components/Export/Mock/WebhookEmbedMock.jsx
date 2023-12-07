import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WebhookEmbedMockStyles from "./Styles/WebhookEmbedMock.styles";
import { format, parseISO } from "date-fns";
import { IconButton } from "@mui/material";
import { getTimeZone } from "../../../utils";
import {
  getFormattedInnerHtml,
  selectExport,
} from "../../../features/export/exportSlice";
import { useDispatch, useSelector } from "react-redux";

const WebhookEmbedMock = ({ embed, alwaysExpanded = false }) => {
  const dispatch = useDispatch();
  const { mediaMap } = useSelector(selectExport);

  const classes = WebhookEmbedMockStyles({
    borderLeftColor: embed?.color?.toString?.(16),
  });

  const [expanded, setExpanded] = useState(false);

  const getEmbedAuthor = () => {
    const { name, url } = embed.author || {};
    const icon_url =
      mediaMap[embed.getAuthorIconUrl()] || embed.getAuthorIconUrl();
    return (
      <Box display="flex" alignItems="center" gap="10px">
        {icon_url && (
          <img
            className={classes.authorIcon}
            src={icon_url}
            alt="author-icon"
          />
        )}
        {url && (
          <a
            className={classes.embedAuthorHref}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <Typography
              sx={{ display: "block", whiteSpace: "pre-line" }}
              variant="subtitle2"
              dangerouslySetInnerHTML={{
                __html: dispatch(
                  getFormattedInnerHtml(name, false, alwaysExpanded)
                ),
              }}
            />
          </a>
        )}
        {!url && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="subtitle2"
            dangerouslySetInnerHTML={{
              __html: dispatch(
                getFormattedInnerHtml(name, false, alwaysExpanded)
              ),
            }}
          />
        )}
      </Box>
    );
  };

  const getThumbnail = () => {
    const url = mediaMap[embed.getThumbnailUrl()] || embed.getThumbnailUrl();
    return (
      <>
        {url && (
          <img className={classes.thumbnailImg} src={url} alt="thumbnail" />
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
            className={classes.embedBodyTitleHref}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <Typography
              sx={{ display: "block", whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{
                __html: dispatch(
                  getFormattedInnerHtml(title, false, alwaysExpanded)
                ),
              }}
            />
          </a>
        )}
        {!url && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{
              __html: dispatch(
                getFormattedInnerHtml(title, false, alwaysExpanded)
              ),
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
          __html: dispatch(
            getFormattedInnerHtml(description, false, alwaysExpanded)
          ),
        }}
      />
    );
  };

  const getField = (field) => {
    const { name, value } = field;
    return (
      <Box mt="15px" display="flex" flexDirection="column">
        {name && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{
              __html: dispatch(
                getFormattedInnerHtml(name, false, alwaysExpanded)
              ),
            }}
          />
        )}
        {value && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: dispatch(
                getFormattedInnerHtml(value, false, alwaysExpanded)
              ),
            }}
          />
        )}
        {}
      </Box>
    );
  };

  const getImage = () => {
    const url = mediaMap[embed.getImageUrl()] || embed.getImageUrl();
    return (
      <>{url && <img className={classes.embedImage} src={url} alt="embed" />}</>
    );
  };

  const getFooter = () => {
    const { timestamp, footer } = embed;
    const { text } = footer || {};
    const icon_url =
      mediaMap[embed.getFooterIconUrl()] || embed.getFooterIconUrl();

    let parsedDate;
    let formattedDate;
    let tz;

    if (timestamp) {
      parsedDate = parseISO(timestamp, new Date());
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
          <img className={classes.footerImg} src={icon_url} alt="footer-icon" />
        )}
        {text && (
          <Typography
            sx={{ display: "block", whiteSpace: "pre-line" }}
            variant="caption"
            dangerouslySetInnerHTML={{
              __html: dispatch(
                getFormattedInnerHtml(text, false, alwaysExpanded)
              ),
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
      className={classes.embedAccordian}
    >
      <AccordionSummary
        className={classes.embedAccordianSummary}
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
