import React from "react";
import styled, { keyframes } from "styled-components";
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
    <Stack spacing={3} className={classes.boxContainer}>
      <Stack>
        <CusImg src="discrub2.png" />
      </Stack>
      <Stack className={classes.paper}>
        <Stack padding={3} spacing={2}>
          <Accordion expanded>
            <AccordionSummary>
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
                      <Typography variant="h6">
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

const logoAnim = keyframes`
0% {
    transform: rotate(4deg) perspective(1px);
    box-shadow: 0px 0px 5px rgb(79, 201, 201, 0.5), 0px 0px 20px #5a415a,
      3px 1px black;
  }
  50% {
    transform: rotate(-4deg) rotateY(-20deg) perspective(1px);
    box-shadow: 0px 0px 5px rgb(79, 201, 201, 0.5), 0px 0px 20px #5a415a,
      -3px 1px black;
  }
  100% {
    transform: rotate(4deg) perspective(1px);
    box-shadow: 0px 0px 5px rgb(79, 201, 201, 0.5), 0px 0px 20px #5a415a,
      3px 1px black;
  }
`;

const CusImg = styled.img`
  user-select: none;
  border-radius: 15px;
  width: 200px;
  margin: auto;
  pointer-events: none;
  animation: ${logoAnim} infinite 55s both;
`;

export default About;
