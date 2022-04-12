import React, { useState, useRef } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import { useReactToPrint } from "react-to-print";
import { Box, Grid, Stack } from "@mui/material";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import MessageChip from "../Chips/MessageChip";
import { FormattedContent } from "../DiscordComponents/DiscordTable/DiscordTable";
import { discordPrimary, discordSecondary } from "../../styleConstants";
const options = ["PDF", "HTML", "JSON"];

const ExportButtonGroup = ({ rows, recipients, exportTitle }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
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
    },
  });
  const handlePdf = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleClick = () => {
    switch (options[selectedIndex]) {
      case "HTML":
        handleHtml();
        break;
      case "PDF":
        handlePdf();
        break;
      case "JSON":
        let json_string = JSON.stringify(rows);
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

  return (
    <>
      <Box sx={{ display: "none", margin: 0 }}>
        <Box sx={{ backgroundColor: discordPrimary }} ref={componentRef}>
          <Stack justifyContent="center" alignItems="center">
            {exportTitle()}
          </Stack>
          {rows.map((row) => {
            return (
              <Grid
                sx={{ border: `1px solid ${discordSecondary}`, padding: 5 }}
                container
              >
                <Grid xs={4} item>
                  <Grid sx={{ paddingLeft: 2 }} container>
                    <Grid xs={12} item>
                      <MessageChip
                        sx={{
                          border: "none",
                          backgroundColor: "transparent",
                          userSelect: "none",
                        }}
                        username={row.username}
                        avatar={`https://cdn.discordapp.com/avatars/${row.author.id}/${row.author.avatar}.png`}
                        content={row.username}
                      />
                    </Grid>
                    <Grid px={1} item xs={12}>
                      <DiscordTypography
                        sx={{ userSelect: "none" }}
                        variant="caption"
                      >
                        {new Date(Date.parse(row.timestamp)).toLocaleString(
                          "en-US"
                        )}
                      </DiscordTypography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    wordBreak: "break-all",
                  }}
                  item
                  xs={8}
                  px={1}
                >
                  <FormattedContent
                    shrink={false}
                    recipients={recipients}
                    message={row.content}
                  />
                </Grid>
              </Grid>
            );
          })}
        </Box>
      </Box>

      <ButtonGroup variant="contained" ref={anchorRef}>
        <DiscordButton label={options[selectedIndex]} onClick={handleClick} />
        <DiscordButton
          icon={<ArrowDropDownIcon />}
          size="small"
          onClick={handleToggle}
        />
      </ButtonGroup>
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
