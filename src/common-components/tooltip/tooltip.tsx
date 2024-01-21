import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip as MuiTooltip, TooltipProps, useTheme } from "@mui/material";

const Tooltip = (
  props: {
    description?: string;
  } & TooltipProps
) => {
  const theme = useTheme();
  const { title, description, children, ...rest } = props;
  return (
    <MuiTooltip
      disableInteractive
      TransitionProps={{
        timeout: {
          appear: 1,
          enter: 1,
          exit: 500,
        },
      }}
      {...rest}
      title={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            color: theme.palette.text.secondary,
          }}
        >
          <strong>{title}</strong>
          {description && (
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.1,
                fontWeight: 550,
              }}
              mt={0.5}
              variant="caption"
            >
              {description}
            </Typography>
          )}
        </Box>
      }
    >
      <span>{children}</span>
    </MuiTooltip>
  );
};

export default Tooltip;
