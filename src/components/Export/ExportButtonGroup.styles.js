import { makeStyles } from "@mui/styles";

const ExportButtonGroupStyles = makeStyles(() => ({
  boxContainer: {
    display: "none",
    margin: 0,
  },
  typography: {
    opacity: 0.4,
  },
  boldTypography: {
    fontWeight: "bold",
  },
  stack: {
    border: "1px solid silver",
    marginBottom: "10px",
    padding: "10px",
  },
}));

export default ExportButtonGroupStyles;
