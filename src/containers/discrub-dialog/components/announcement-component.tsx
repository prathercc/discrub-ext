import { useEffect, useState } from "react";
import { Stack, useTheme, Box, Button } from "@mui/material";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { fetchAnnouncementData } from "../../../services/github-service";
import AnnouncementDialog from "./announcement-dialog.tsx";
import { setSetting } from "../../../services/chrome-service.ts";
import { DiscrubSetting } from "../../../enum/discrub-setting.ts";
import { AppSettings } from "../../../features/app/app-types.ts";

type AnnouncementComponentProps = {
  currentRevision: string;
  onChangeSettings: (settings: AppSettings) => void;
  isInitialized: boolean;
};

function AnnouncementComponent({
  currentRevision,
  onChangeSettings,
  isInitialized,
}: AnnouncementComponentProps) {
  const { palette } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const getAnnouncementData = async () => {
      const data = await fetchAnnouncementData();
      if (data.rev && data.rev !== currentRevision) {
        const settings = await setSetting(
          DiscrubSetting.CACHED_ANNOUNCEMENT_REV,
          data.rev,
        );
        onChangeSettings(settings);
        setDialogOpen(true);
      }
    };
    if (isInitialized) {
      getAnnouncementData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  return (
    <Stack
      spacing={2}
      sx={{
        position: "fixed",
        top: "10px",
        right: "115px",
        width: "140px",
        height: "58px",
        backgroundColor: palette.background.default,
        border: `1px solid ${palette.secondary.dark}`,
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          bgcolor: "background.paper",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "6px !important",
          padding: "3px",
        }}
      >
        <Button
          onClick={() => setDialogOpen(true)}
          startIcon={<AnnouncementIcon fontSize="small" />}
          color="primary"
          variant="contained"
        >
          News
        </Button>
        <AnnouncementDialog
          open={dialogOpen}
          handleClose={() => setDialogOpen(false)}
        />
      </Box>
    </Stack>
  );
}

export default AnnouncementComponent;
