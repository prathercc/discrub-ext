import { makeStyles } from "@mui/styles";

const ExportButtonStyles = makeStyles(() => ({
  dialogPaper: {
    minWidth: "398px",
  },
  dialogChannelsBox: {
    width: 350,
    height: 200,
    overflow: "auto",
  },
  dialogBtnStack: {
    width: "100%",
  },
  dialogStatusStack: {
    minWidth: 300,
  },
  exportOptions: {
    backgroundColor: "rgb(32, 34, 37, 0.25)",
    borderRadius: "15px",
  },
}));

export default ExportButtonStyles;
