import { makeStyles } from "@mui/styles";

const AboutStyles = makeStyles(() => ({
  boxContainer: {
    padding: "15px",
    maxHeight: "85%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  paper: {
    maxHeight: "600px",
    overflow: "auto",
  },
  accordianTitle: {
    cursor: "pointer !important",
    userSelect: "none !important",
  },
  cryptoImg: {
    width: "130px",
  },
  kofiImg: {
    border: "0px",
    width: 240,
  },
  changelogText: {
    opacity: 0.5,
  },
}));

export default AboutStyles;
