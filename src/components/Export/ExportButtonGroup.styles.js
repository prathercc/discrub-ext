import { makeStyles } from "@mui/styles";

const ExportButtonGroupStyles = makeStyles(() => ({
  boxContainer: {
    display: "none",
    margin: 0,
  },
  typographyTitle: {
    color: "rgb(88, 101, 242, 1) !important",
  },
  typography: {
    color: "rgb(47, 49, 54, 1) !important",
  },
  boldTypography: {
    fontWeight: "bold",
    color: "rgb(88, 101, 242, 1) !important",
  },
  stack: {
    width: "100%",
  },
  stackContentContainer: {
    border: "1px solid silver",
    width: "95%",
  },
}));

export default ExportButtonGroupStyles;
