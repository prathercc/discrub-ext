import { makeStyles } from "@mui/styles";

const ModalStyles = makeStyles(() => ({
  box: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  deleteIcon: {
    color: "red",
  },
  icon: {
    color: "rgb(210, 213, 247, 1)",
  },
  objIdTypography: {
    display: "block",
  },
}));

export default ModalStyles;
