import { Typography, useTheme } from "@mui/material";

export type DateProps = { longDateTime: string; shortDateTime: string };

const Date = ({ longDateTime, shortDateTime }: DateProps) => {
  const theme = useTheme();

  return (
    <Typography
      title={longDateTime}
      sx={{ color: theme.palette.text.disabled, lineHeight: 0 }}
      variant="caption"
    >
      {shortDateTime}
    </Typography>
  );
};
export default Date;
