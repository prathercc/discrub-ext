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

const options = ["HTML", "PDF", "JSON"];

const ExportButtonGroup = ({ exportTitle }) => {
  const { state: messageState } = useContext(MessageContext);
  const { messages } = messageState;

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
          let json_string = JSON.stringify(messages);
          let link = document.createElement("a");
          link.download = "Exported Messages.json";
          let blob = new Blob([json_string], { type: "text/plain" });
          link.href = window.URL.createObjectURL(blob);
          link.click();
          break;
        default:
          break;
      }
    };
    const getLastElement = () =>
      document.getElementById(`message-data-${messages.length - 1}`);
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
  }, [printing, messages, handleHtml, handlePdf, selectedIndex]);

  return (
    <>
      <Box sx={{ display: "none", margin: 0 }}>
        <Box ref={componentRef}>
          <Stack justifyContent="center" alignItems="center">
            {exportTitle()}
            <Typography sx={{ opacity: 0.4 }}>
              All times shown below are in GMT*
            </Typography>
          </Stack>
          {printing &&
            messages.map((row, index) => {
              const messageDate = new Date(Date.parse(row.timestamp));
              return (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={20}
                  sx={{
                    border: "1px solid silver",
                    marginBottom: "10px",
                    padding: "10px",
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={0}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      {row.username}:
                    </Typography>
                    <Typography>{`${messageDate.getUTCDate()}/${messageDate.getUTCMonth()}/${messageDate.getUTCFullYear()}`}</Typography>
                    <Typography>{`${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()}`}</Typography>
                  </Stack>
                  <Typography id={`message-data-${index}`}>
                    {row.content}
                  </Typography>
                </Stack>
              );
            })}
        </Box>
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
        sx={{ "z-index": 9999 }}
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
