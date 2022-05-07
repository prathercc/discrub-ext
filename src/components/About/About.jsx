/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import styled, { keyframes } from "styled-components";
import GitHubButton from "react-github-btn";
import { Tooltip, Paper, Typography } from "@mui/material";

function About() {
  return (
    <Box
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <CustomGrid my={2} container>
        <CustomGrid item xs={12}>
          <CusImg src="discrub2.png" />
        </CustomGrid>
      </CustomGrid>

      <Paper sx={{ width: "85%" }}>
        <CustomGrid spacing={2} container>
          <CustomGrid
            sx={{ flexDirection: "column" }}
            xs={12}
            item
          ></CustomGrid>
          <CustomGrid xs={12} item>
            <a href="https://ko-fi.com/W7W4AAIBR" target="_blank">
              <img
                style={{ border: "0px", width: 165 }}
                src="https://cdn.ko-fi.com/cdn/kofi2.png?v=3"
                border="0"
                alt="Buy Me a Coffee at ko-fi.com"
              />
            </a>
          </CustomGrid>
          <CustomGrid sx={{ flexDirection: "column" }} item xs={4}>
            <Typography variant="caption">Ethereum</Typography>
            <Tooltip title="0x09b120deE370ddadf629D2428A3B12cA3F614222">
              <img
                alt="Donate ETH"
                style={{ width: "120px" }}
                src="ethereum.png"
              />
            </Tooltip>
          </CustomGrid>
          <CustomGrid sx={{ flexDirection: "column" }} item xs={4}>
            <Typography variant="caption">Bitcoin</Typography>
            <Tooltip title="3A7JHbygZeHMawz3vwckuYhP84hdkPTQNm">
              <img
                alt="Donate BTC"
                style={{ width: "120px" }}
                src="bitcoin.png"
              />
            </Tooltip>
          </CustomGrid>
          <CustomGrid sx={{ flexDirection: "column" }} item xs={4}>
            <Typography variant="caption">Litecoin</Typography>
            <Tooltip title="MVTPtXVTF6RNwfcTt71J8cn6uqNApb3S75">
              <img
                alt="Donate LTC"
                style={{ width: "120px" }}
                src="litecoin.png"
              />
            </Tooltip>
          </CustomGrid>
        </CustomGrid>
      </Paper>
      <Paper sx={{ width: "85%" }}>
        <CustomGrid spacing={2} container>
          <CustomGrid item xs={4}>
            <GitHubButton
              href="https://github.com/sponsors/prathercc"
              data-color-scheme="no-preference: light; light: dark; dark: dark;"
              data-icon="octicon-heart"
              data-size="large"
              aria-label="Sponsor @prathercc on GitHub"
            >
              Sponsor
            </GitHubButton>
          </CustomGrid>
          <CustomGrid item xs={4}>
            <GitHubButton
              href="https://github.com/prathercc"
              data-color-scheme="no-preference: light; light: dark; dark: dark;"
              data-size="large"
              data-show-count="true"
              aria-label="Follow @prathercc on GitHub"
            >
              Follow @prathercc
            </GitHubButton>
          </CustomGrid>
          <CustomGrid item xs={4}>
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
          </CustomGrid>
          <CustomGrid item xs={4}>
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
          </CustomGrid>
          <CustomGrid item xs={4}>
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
          </CustomGrid>
          <CustomGrid item xs={4}>
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
          </CustomGrid>
        </CustomGrid>
      </Paper>
    </Box>
  );
}

const CustomGrid = (props) => {
  return (
    <Grid
      {...props}
      sx={{
        ...props.sx,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.children}
    </Grid>
  );
};

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
  width: 180px;
  margin: auto;
  pointer-events: none;
  animation: ${logoAnim} infinite 55s both;
`;

export default About;
