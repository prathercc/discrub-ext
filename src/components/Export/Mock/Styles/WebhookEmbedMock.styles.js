import { makeStyles } from "@mui/styles";

const WebhookEmbedMockStyles = makeStyles(() => ({
  embedAccordian: {
    backgroundColor: "#202225 !important",
    borderLeft: ({ borderLeftColor }) => `3px solid ${borderLeftColor}`,
  },
  embedAccordianSummary: {
    cursor: "default !important",
    "& .Mui-expanded": {
      margin: "0px !important",
      marginTop: "15px !important",
    },
  },
  embedTitleTypography: {
    cursor: "pointer !important",
  },
  authorIcon: {
    width: "24px",
    height: "24px",
  },
  thumbnailImg: {
    maxWidth: "80px",
    maxHeight: "80px",
  },
  embedAuthorHref: {
    textDecoration: "none",
    "& h6": {
      cursor: "pointer !important",
    },
  },
  embedBodyTitleHref: {
    textDecoration: "none",
    "& p": {
      color: "rgb(0, 168, 252)",
      cursor: "pointer !important",
    },
  },
  footerImg: {
    width: "20px",
    height: "20px",
  },
  embedImage: {
    marginTop: "15px",
    maxWidth: "400px",
    maxHeight: "300px",
  },
}));

export default WebhookEmbedMockStyles;
