import { makeStyles } from "@mui/styles";

const MenuBarStyles = makeStyles(() => ({
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: "rgb(88, 101, 242, 1)",
    },
    "& .MuiTab-root": {
      color: "rgb(210, 213, 247, 1)",
      cursor: "pointer",
    },
    "& .MuiTab-root.Mui-selected": {
      color: "rgb(210, 213, 247, 1)",
    },
    "& .MuiTabs-flexContainer": {
      backgroundColor: "rgb(47, 49, 54, 1)",
    },
  },
}));

export default MenuBarStyles;
