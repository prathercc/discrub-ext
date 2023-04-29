import { makeStyles } from "@mui/styles";

const AdvancedFilteringStyles = makeStyles(() => ({
  filterByUserName: {
    width: "280px !important",
  },
  filterButton: {
    width: "100% !important",
    userSelect: "none !important",
  },
  collapse: {
    "& .MuiCollapse-wrapperInner": {
      minHeight: "47px !important",
    },
  },
}));

export default AdvancedFilteringStyles;
