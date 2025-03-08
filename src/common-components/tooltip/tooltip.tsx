import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip as MuiTooltip, TooltipProps, useTheme } from "@mui/material";

const Tooltip = (
  props: {
    description?: string;
    secondaryDescription?: string;
  } & TooltipProps,
) => {
  const theme = useTheme();
  const { title, description, secondaryDescription, children, ...rest } = props;
  return (
    <MuiTooltip
      disableInteractive
      PopperProps={{
        sx: { maxWidth: "200px", backgroundColor: "transparent" },
      }}
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
            backgroundColor: "transparent",
          }}
        >
          <strong>{title}</strong>
          {description && (
            <>
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
              {secondaryDescription && (
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.1,
                    fontWeight: 550,
                  }}
                  mt={1}
                  variant="caption"
                >
                  {secondaryDescription}
                </Typography>
              )}
            </>
          )}
        </Box>
      }
    >
      {children}
    </MuiTooltip>
  );
};

export default Tooltip;
