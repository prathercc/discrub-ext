/*global chrome*/
import * as React from "react";
import Button from "@mui/material/Button";

function DiscordButton({ icon, label, onClick, neutral = false, ...props }) {
  return (
    <Button
      {...props}
      sx={{
        "&:hover": {
          backgroundColor: neutral
            ? "rgb(210, 213, 247)"
            : "rgb(88, 101, 242, 0.7)",
        },
        backgroundColor: neutral
          ? "rgb(210, 213, 247)"
          : "rgb(88, 101, 242, 0.7)",
        textTransform: "none",
        fontFamily: 'Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif',
        fontWeight: 500,
        color: neutral ? "#202225" : "rgb(210, 213, 247)",
        ...props.sx,
      }}
      style={{ width: "90px", height: "30px" }}
      startIcon={icon}
      variant="contained"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export default DiscordButton;
