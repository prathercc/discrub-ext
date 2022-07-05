import { makeStyles } from "@mui/styles";

const AboutStyles = makeStyles(() => ({
  boxContainer: {
    padding: "15px",
    maxHeight: "85%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  paper: {
    maxHeight: "400px",
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#f1f1f1",
    },
    "&::-webkit-scrollbar-track": {
      background: "#888",
    },
  },
  accordianTitle: {
    cursor: "pointer !important",
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
