import { useEffect, useState } from "react";
import { Stack, useTheme, Box, Skeleton, Typography } from "@mui/material";
import {
  Announcement,
  fetchAnnouncementData,
} from "../../../services/github-service";

function AnnouncementComponent() {
  const { palette } = useTheme();
  const [announcement, setAnnouncement] = useState<Announcement | Maybe>(null);

  useEffect(() => {
    const getAnnouncementData = async () => {
      const data = await fetchAnnouncementData();
      setAnnouncement(data);
    };
    getAnnouncementData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      spacing={2}
      sx={{
        position: "fixed",
        top: "10px",
        right: "55px",
        width: "200px",
        height: "300px",
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
        {announcement ? (
          <Stack sx={{ flexDirection: "column" }}>
            <Stack
              sx={{
                width: "100%",
                borderRadius: "5px",
                backgroundColor: "primary.dark",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "rgba(232, 217, 217, 0.75) 2px 2px 5px -2px",
                marginBottom: "15px",
              }}
            >
              <Typography variant="body1">{announcement.title}</Typography>
            </Stack>
            <Typography variant="caption">{announcement.date}</Typography>
            <Typography variant="caption">{announcement.message}</Typography>
          </Stack>
        ) : (
          <Skeleton
            animation="wave"
            sx={{ mt: 1 }}
            variant="rounded"
            height="90%"
            width="90%"
          />
        )}
      </Box>
    </Stack>
  );
}

export default AnnouncementComponent;
