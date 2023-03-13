import { makeStyles } from "@mui/styles";

const DonationComponentStyles = makeStyles(() => ({
  box: {
    minWidth: "290px",
    padding: "3px",
    backgroundColor: "#2f3136",
    border: "1px solid #202225",
    borderRadius: "10px",
    "& .MuiTypography-root": { color: "#d0d3f5 !important" },
    "& .MuiAvatar-root": {
      color: "#2f3136 !important",
      backgroundColor: "#5865f2 !important",
    },
    boxShadow: "4px 2px 5px 1px rgb(0 0 0 / 41%)",
  },
  stack: {
    position: "fixed",
    bottom: "7px",
    right: "27px",
    width: "1200px",
  },
}));

export default DonationComponentStyles;
