import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";

function Identity({ userData }) {
  let obscurredText =
    "************************************************************";
  const [authDisplay, setAuthDisplay] = useState(obscurredText);
  const propObjArr = [
    {
      label: "Username",
      disabled: true,
      value: `${userData?.username}#${userData?.discriminator}`,
    },
    { label: "Email", disabled: true, value: userData?.email },
    { label: "Identifier", disabled: true, value: userData?.id },
  ];
  return (
    <Box
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      <DiscordPaper>
        {userData && (
          <>
            <DiscordTypography variant="h5">Your Identity</DiscordTypography>
            <DiscordTypography variant="caption">
              This information is not saved or stored, use caution displaying
              this data to others.
            </DiscordTypography>
            <Tooltip
              title={
                authDisplay === userData?.token
                  ? "Click To Obscure"
                  : "Click To Show"
              }
            >
              <DiscordTextField
                onClick={() =>
                  setAuthDisplay(
                    authDisplay === userData?.token
                      ? obscurredText
                      : userData?.token
                  )
                }
                label="Authorization"
                disabled={true}
                value={authDisplay}
                sx={{ my: "5px" }}
              />
            </Tooltip>
            {propObjArr.map((propObj) => {
              return (
                <DiscordTextField
                  label={propObj.label}
                  disabled={propObj.disabled}
                  value={propObj.value}
                  sx={{ my: "5px" }}
                />
              );
            })}
          </>
        )}
        {!userData && <DiscordSpinner />}
      </DiscordPaper>
    </Box>
  );
}

export default Identity;
