import React from "react";
import Box from "@mui/material/Box";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";

function Identity({ userData }) {
  const propObjArr = [
    { label: "Authorization", disabled: true, value: userData?.token },
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
      {userData && (
        <>
          <DiscordTypography variant="h5">Your Identity</DiscordTypography>
          <DiscordTypography variant="caption">
            This information is not saved or stored, use caution displaying this
            data to others.
          </DiscordTypography>
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
    </Box>
  );
}

export default Identity;
