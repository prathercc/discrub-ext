import Box from "@mui/material/Box";
import { Typography, useTheme } from "@mui/material";

const ModalDebugMessage = ({
  debugMessage,
}: {
  debugMessage: string | Maybe;
}) => {
  const theme = useTheme();
  return (
    <Box
      my={1}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        opacity: debugMessage?.length ? 1 : 0,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.warning.main }}>
        {debugMessage || "An error occurred"}
      </Typography>
    </Box>
  );
};
export default ModalDebugMessage;
