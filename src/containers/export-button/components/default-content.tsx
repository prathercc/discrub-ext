import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ImageToggle from "./image-toggle";
import Progress from "./progress";
import PreviewImageToggle from "./preview-image-toggle";
import PerPage from "./per-page";
import ArtistModeToggle from "./artist-mode-toggle";
import SeparateThreadToggle from "./separate-thread-toggle";

type DefaultContentProps = {
  isExporting: boolean;
  messageCount: number;
};

const DefaultContent = ({ isExporting, messageCount }: DefaultContentProps) => {
  const theme = useTheme();

  return (
    <DialogContent>
      {!isExporting && (
        <>
          <DialogContentText>
            <Typography variant="body2">
              <strong>{messageCount}</strong> messages are available to export
            </Typography>
          </DialogContentText>
          <Stack direction="row" justifyContent="flex-end" mt={1} mb={1}>
            <Stack
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "15px",
                padding: "5px",
              }}
              direction="column"
              spacing={1}
              alignItems="center"
            >
              <Typography variant="body2">Export Options</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SeparateThreadToggle />
                <ArtistModeToggle />
                <PreviewImageToggle />
                <ImageToggle />
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <PerPage />
          </Stack>
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default DefaultContent;
