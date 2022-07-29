import React, { useState, useRef, useEffect, useContext } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { useReactToPrint } from "react-to-print";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";

const options = ["HTML", "PDF", "JSON"];

const ExportButtonGroup = () => {
  const classes = ExportButtonGroupStyles();

  const { state: messageState, getExportTitle } = useContext(MessageContext);
  const { messages, filters, filteredMessages, threads } = messageState;
  const exportMessages = filters.length > 0 ? filteredMessages : messages;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printing, setPrinting] = useState(false);

  const componentRef = useRef();

  const handleHtml = useReactToPrint({
    content: () => componentRef.current,
    print: (iframe) => {
      iframe.contentWindow.document.lastElementChild.getElementsByTagName(
        "body"
      )[0].margin = 0;
      const html = iframe.contentWindow.document.lastElementChild.outerHTML;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      a.download = "Exported Messages.html";
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      setPrinting(false);
    },
    removeAfterPrint: true,
  });
  const handlePdf = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => setPrinting(false),
    removeAfterPrint: true,
  });

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const handleClick = () => {
      switch (options[selectedIndex]) {
        case "HTML":
          handleHtml();
          break;
        case "PDF":
          handlePdf();
          break;
        case "JSON":
          let json_string = JSON.stringify(exportMessages);
          let link = document.createElement("a");
          link.download = "Exported Messages.json";
          let blob = new Blob([json_string], { type: "text/plain" });
          link.href = window.URL.createObjectURL(blob);
          link.click();
          setPrinting(false);
          break;
        default:
          break;
      }
    };
    const getLastElement = () =>
      document.getElementById(`message-data-${exportMessages.length - 1}`);
    const loadContent = async () => {
      let lastElement = getLastElement();
      while (!lastElement) {
        // eslint-disable-next-line no-loop-func
        await new Promise(() =>
          setTimeout(() => {
            lastElement = getLastElement();
          }, 5000)
        );
      }
      handleClick();
    };
    if (printing) {
      loadContent();
    }
  }, [printing, exportMessages, handleHtml, handlePdf, selectedIndex]);

  return (
    <>
      <Box className={classes.boxContainer}>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          ref={componentRef}
          className={classes.stackMessageContainer}
        >
          <Stack justifyContent="center" alignItems="center">
            {getExportTitle()}
            <Typography className={classes.typographyId}>
              UTC mm/dd/yyyy hh:mm:ss
            </Typography>
          </Stack>
          {printing &&
            exportMessages.map((row, index) => {
              const messageDate = new Date(Date.parse(row.timestamp));
              const foundThread = threads.find(
                (thread) => thread.id === row.id || thread.id === row.channel_id
              );
              return (
                <Stack
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  className={classes.stackContentContainer}
                  my={1}
                  padding={1}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={20}
                    className={classes.stack}
                  >
                    <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="flex-start"
                      spacing={0}
                    >
                      <Typography className={classes.boldTypography}>
                        {row.username}:
                      </Typography>
                      <Typography className={classes.typography}>{`${
                        messageDate.getUTCMonth() + 1
                      }/${messageDate.getUTCDate()}/${messageDate.getUTCFullYear()}`}</Typography>
                      <Typography
                        className={classes.typography}
                      >{`${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()}`}</Typography>
                      <Typography className={classes.typographyId}>
                        Message ID: {row.id}
                      </Typography>
                      {foundThread && (
                        <>
                          <Typography className={classes.typographyId}>
                            Thread Name {foundThread.name}
                          </Typography>
                          <Typography className={classes.typographyId}>
                            Thread ID: {foundThread.id}
                          </Typography>
                        </>
                      )}
                    </Stack>
                    <Typography
                      className={classes.typography}
                      id={`message-data-${index}`}
                    >
                      {row.content}
                    </Typography>
                  </Stack>
                  {row.attachments?.length > 0 ? (
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="flex-start"
                      spacing={1}
                      className={classes.stack}
                    >
                      {row.attachments.map((attachment, index) => (
                        <Typography className={classes.typography}>
                          <a href={attachment.url}>Attachment {index + 1}</a>
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              );
            })}
        </Stack>
      </Box>

      {!printing && (
        <ButtonGroup variant="contained" ref={anchorRef}>
          <Button onClick={() => setPrinting(true)}>
            {options[selectedIndex]}
          </Button>
          <Button
            startIcon={<ArrowDropDownIcon />}
            size="small"
            onClick={handleToggle}
          />
        </ButtonGroup>
      )}
      {printing && (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      )}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
export default ExportButtonGroup;
