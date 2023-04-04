import { makeStyles } from "@mui/styles";

const SponsorshipStyles = makeStyles(() => ({
  stack: {
    position: "fixed",
    width: "221px",
    background: "rgb(32, 34, 37, 1)",
    border: "1px solid rgb(210, 213, 247, 0.2)",
    borderRadius: "5px",
    height: "242px",
    boxShadow: "4px 2px 5px 1px rgb(0 0 0 / 41%)",
    flexDirection: "column !important",
    justifyContent: "flex-start !important",
    alignItems: "flex-start !important",
  },
  sponsor0: {
    left: "6px",
    top: "70px",
  },
  sponsor1: {
    left: "6px",
    top: "330px",
  },
  headerbackground: {
    width: "100%",
    height: "65px",
    backgroundColor: "#5865f2",
    marginBottom: "20px",
  },
  headerbackgroundImage: {
    top: "-47px",
    left: "2px",
    width: "217px",
    height: "59px",
    position: "relative",
  },
  headerTitleBox: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "4px !important",
  },
  headerTitleAvatar: {
    color: "rgb(88, 101, 242) !important",
    backgroundColor: "transparent !important",
    height: "20px !important",
    width: "20px !important",
    marginRight: "6px",
  },
  headerSummaryBox: {
    display: "flex",
    width: "95%",
    justifyContent: "flex-start",
    marginLeft: "4px !important",
    marginTop: "2px !important",
    overflow: "auto",
    height: "95px",
  },
  headerSummaryTypography: {
    color: "#B5BAC1 !important",
  },
  headerJoinButtonBox: {
    width: "95%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerJoinButton: {
    userSelect: "none",
  },
  headerAvatar: {
    left: "6px",
    top: "31px",
    zIndex: 900,
    backgroundColor: "rgb(32, 34, 37, 1) !important",
    color: "white !important",
    borderRadius: "10px !important",
    padding: "5px !important",
    "& img": {
      borderRadius: "5px !important",
    },
  },
  infoButton: { position: "absolute !important", bottom: "0px", right: "0px" },
  email: {
    color: "white !important",
  },
}));

export default SponsorshipStyles;
