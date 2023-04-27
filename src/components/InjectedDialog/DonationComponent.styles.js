import { makeStyles } from "@mui/styles";

const DonationComponentStyles = makeStyles(() => ({
  box: {
    padding: "0px",
    paddingLeft: "5px",
    paddingRight: "5px",
    backgroundColor: "#2f3136",
    border: "1px solid #202225",
    borderRadius: "10px",
    "& .MuiTypography-root": {
      color: "#d0d3f5 !important",
      userSelect: "none !important",
    },
    "& .MuiAvatar-root": {
      color: "#2f3136 !important",
      backgroundColor: "#5865f2 !important",
    },
    boxShadow: "4px 2px 5px 1px rgb(0 0 0 / 41%)",
  },
  stack: {
    position: "fixed",
    bottom: "2px",
    right: "27px",
    width: "1200px",
  },
  arrowBox: {
    position: "fixed",
    bottom: "46px",
    right: "221px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "803px",
    justifyContent: "space-between",
  },
}));

export default DonationComponentStyles;
