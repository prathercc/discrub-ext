import { makeStyles } from "@mui/styles";

const BulkExportButtonStyles = makeStyles(() => ({
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
}));

export default BulkExportButtonStyles;
