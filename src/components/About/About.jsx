import React from "react";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AboutStyles from "./About.styles";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import changelog from "./changelog.json";

function About() {
  const classes = AboutStyles();

  return (
    <Stack className={classes.boxContainer}>
      <Stack className={classes.paper}>
        <Stack padding={3} spacing={2}>
          <Accordion expanded>
            <AccordionSummary className={classes.accordianSummary}>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <ChangeCircleIcon />
                <Typography className={classes.accordianTitle}>
                  Change-log
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {changelog.map((change) => {
                  return (
                    <Stack>
                      <Typography variant="body2">
                        Version {change.version}
                      </Typography>
                      <ul>
                        {change.changes.map((innerChange) => {
                          return (
                            <Typography
                              className={classes.changelogText}
                              variant="caption"
                            >
                              <li>{innerChange}</li>
                            </Typography>
                          );
                        })}
                      </ul>
                    </Stack>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default About;
