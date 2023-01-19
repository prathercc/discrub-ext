import React, { useState, useRef, useContext } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Stack,
  Button,
  CircularProgress,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ButtonGroup,
  ClickAwayListener,
} from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportUtils from "./ExportUtils";
import ExportMessages from "./ExportMessages";

const options = ["HTML", "JSON"];

const ExportButtonGroup = () => {
  const { state: messageState } = useContext(MessageContext);
  const { messages, filters, filteredMessages } = messageState;
  const exportMessages = filters.length > 0 ? filteredMessages : messages;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printing, setPrinting] = useState(false);

  const componentRef = useRef();

  const { downloadHTML, downloadJSON, loadAllContent } = new ExportUtils(
    componentRef,
    () => setPrinting(false),
    `message-data-${exportMessages.length - 1}`
  );

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

  const handleDownload = async (option) => {
    setPrinting(true);
    if (option === "JSON") downloadJSON(exportMessages);
    else {
      const allContentLoaded = await loadAllContent();
      if (allContentLoaded) {
        switch (option) {
          case "HTML":
            downloadHTML();
            break;
          default:
            break;
        }
      }
    }
  };

  return (
    <>
      <ExportMessages componentRef={componentRef} exporting={printing} />

      {printing ? (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      ) : (
        <ButtonGroup variant="contained" ref={anchorRef}>
          <Button onClick={() => handleDownload(options[selectedIndex])}>
            {options[selectedIndex]}
          </Button>
          <Button
            startIcon={<ArrowDropDownIcon />}
            size="small"
            onClick={handleToggle}
          />
        </ButtonGroup>
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
