import { useState } from "react";
import { Stack, Button, Collapse } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import MessageContains from "./components/message-contains";
import HasType from "./components/has-type";
import BeforeAndAfterFields from "../../components/before-and-after-fields";
import PrefilterUser from "../../components/prefilter-user";

type AdvancedFilteringProps = {
  closeAnnouncement?: () => void;
  isDm?: boolean;
};

function AdvancedFiltering({
  closeAnnouncement,
  isDm = false,
}: AdvancedFilteringProps) {
  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: dmState } = useDmSlice();
  const selectedDm = dmState.selectedDm();

  const { state: messageState } = useMessageSlice();
  const messagesLoading = messageState.isLoading();

  const [show, setShow] = useState(false);

  const handleFilterButtonClick = () => {
    if (closeAnnouncement) {
      closeAnnouncement();
    }

    setShow(!show);
  };

  const getChildrenDisabled = (): boolean => {
    if (messagesLoading) return true;
    if (isDm) {
      return !selectedDm;
    } else {
      return !selectedGuild;
    }
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Button
        sx={{ width: "100% !important", userSelect: "none !important" }}
        disabled={Boolean(messagesLoading)}
        onClick={handleFilterButtonClick}
        color="secondary"
        startIcon={show ? <FilterListOffIcon /> : <FilterListIcon />}
      >
        Advanced Filtering
      </Button>
      <Collapse
        sx={{
          "& .MuiCollapse-wrapperInner": {
            minHeight: "47px !important",
          },
        }}
        orientation="vertical"
        in={show}
        unmountOnExit
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <PrefilterUser disabled={getChildrenDisabled()} isDm={isDm} />
            <BeforeAndAfterFields disabled={getChildrenDisabled()} />
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <MessageContains disabled={getChildrenDisabled()} />
            <HasType disabled={getChildrenDisabled()} />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default AdvancedFiltering;
