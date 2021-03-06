import React from "react";
import styled, { keyframes } from "styled-components";
import GitHubButton from "react-github-btn";
import {
  Tooltip,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AboutStyles from "./About.styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import PaidIcon from "@mui/icons-material/Paid";
import GitHubIcon from "@mui/icons-material/GitHub";
import changelog from "./changelog.json";
import RedditIcon from "@mui/icons-material/Reddit";
import LinkIcon from "@mui/icons-material/Link";

function About() {
  const classes = AboutStyles();

  return (
    <Stack spacing={3} className={classes.boxContainer}>
      <Stack>
        <CusImg src="discrub2.png" />
      </Stack>
      <Stack className={classes.paper}>
        <Stack padding={3} spacing={2}>
          <Accordion
            expanded={false}
            onClick={(e) => {
              e.stopPropagation();
              window.open("https://www.reddit.com/r/discrub/", "_blank");
            }}
          >
            <AccordionSummary expandIcon={<LinkIcon />}>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <RedditIcon />
                <Typography className={classes.accordianTitle}>
                  r/discrub
                </Typography>
              </Stack>
            </AccordionSummary>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <GitHubIcon />
                <Typography className={classes.accordianTitle}>
                  Development
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-around"
                  direction="row"
                >
                  <GitHubButton
                    href="https://github.com/sponsors/prathercc"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-icon="octicon-heart"
                    data-size="large"
                    aria-label="Sponsor @prathercc on GitHub"
                  >
                    Sponsor
                  </GitHubButton>
                  <GitHubButton
                    href="https://github.com/prathercc"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Follow @prathercc on GitHub"
                  >
                    Follow @prathercc
                  </GitHubButton>
                  <GitHubButton
                    href="https://github.com/prathercc/discrub-ext/fork"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-icon="octicon-repo-forked"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Fork prathercc/discrub-ext on GitHub"
                  >
                    Fork
                  </GitHubButton>
                </Stack>
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-around"
                  direction="row"
                >
                  <GitHubButton
                    href="https://github.com/prathercc/discrub-ext/issues"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-icon="octicon-issue-opened"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Issue prathercc/discrub-ext on GitHub"
                  >
                    Issue
                  </GitHubButton>
                  <GitHubButton
                    href="https://github.com/prathercc/discrub-ext"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star prathercc/discrub-ext on GitHub"
                  >
                    Star
                  </GitHubButton>
                  <GitHubButton
                    href="https://github.com/prathercc/discrub-ext/subscription"
                    data-color-scheme="no-preference: light; light: dark; dark: dark;"
                    data-icon="octicon-eye"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Watch prathercc/discrub-ext on GitHub"
                  >
                    Watch
                  </GitHubButton>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <PaidIcon />
                <Typography className={classes.accordianTitle}>
                  Donate
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="space-around"
                direction="row"
              >
                <Stack alignItems="center">
                  <Typography variant="caption">Bitcoin</Typography>
                  <Tooltip
                    leaveDelay={3000}
                    title="3A7JHbygZeHMawz3vwckuYhP84hdkPTQNm"
                  >
                    <img
                      alt="Donate BTC"
                      className={classes.cryptoImg}
                      src="bitcoin.png"
                    />
                  </Tooltip>
                </Stack>

                <Stack alignItems="center">
                  <a href="https://ko-fi.com/W7W4AAIBR">
                    <img
                      className={classes.kofiImg}
                      src="https://cdn.ko-fi.com/cdn/kofi2.png?v=3"
                      border="0"
                      alt="Buy Me a Coffee at ko-fi.com"
                    />
                  </a>
                </Stack>

                <Stack alignItems="center">
                  <Typography variant="caption">Ethereum</Typography>
                  <Tooltip
                    leaveDelay={3000}
                    title="0x01aC5D8C7B814eC70Ff5E402297f5b78Ef81137C"
                  >
                    <img
                      alt="Donate ETH"
                      className={classes.cryptoImg}
                      src="ethereum.png"
                    />
                  </Tooltip>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
