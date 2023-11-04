import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import ModalStyles from "../Styles/Modal.styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import { selectMessage } from "../../../features/message/messageSlice";

const EmbedModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const { modify } = useSelector(selectMessage);
  const { message: modifyMessage } = modify || {};

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">View Embeds</Typography>
        <Typography variant="caption">
          Embeds associated with this message can be viewed here
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Stack className={classes.stackContainer} pr="25px" spacing={2}>
          {modifyMessage?.embeds
            ?.filter((embed) => embed.type === "rich")
            .map((embed, i) => {
              return (
                <Accordion
                  className={classes.embedAccordian}
                  sx={{
                    borderLeft: `3px solid #${embed?.color?.toString(16)}`,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      className={classes.embedTitleTypography}
                      variant="body2"
                    >
                      {embed.title || `Embed ${i}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {embed.author?.name && (
                        <Typography variant="caption">
                          {embed.author.name}
                        </Typography>
                      )}
                      {embed?.description && (
                        <Typography variant="caption">
                          {embed.description}
                        </Typography>
                      )}
                      {embed.footer?.text && (
                        <Typography variant="caption">
                          {embed.footer?.text}
                        </Typography>
                      )}
                      {embed.fields?.length > 0 && <Divider />}
                      {embed.fields?.map((field) => {
                        return (
                          <>
                            <Typography variant="caption">
                              <strong>{field.name}</strong>
                            </Typography>
                            <Typography variant="caption">
                              {field.value}
                            </Typography>
                          </>
                        );
                      })}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Stack>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          <Button variant="contained" onClick={handleClose} color="secondary">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default EmbedModal;
