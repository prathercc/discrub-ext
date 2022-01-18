import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styled, { keyframes } from "styled-components";
import GitHubButton from "react-github-btn";

function About({ userData }) {
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
      }}
    >
      <Box>
        <CusImg src="logo.png" />
      </Box>
      <AboutMessages />
    </Box>
  );
}
const AboutMessages = () => {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: "285px",
          left: "395px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc/discrub-ext/discussions"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-comment-discussion"
          data-size="large"
          aria-label="Discuss prathercc/discrub-ext on GitHub"
        >
          Discuss
        </GitHubButton>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: "250px",
          left: "365px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc/discrub-ext/fork"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-repo-forked"
          data-size="large"
          data-show-count="true"
          aria-label="Fork prathercc/discrub-ext on GitHub"
        >
          Fork
        </GitHubButton>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: "285px",
          left: "295px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc/discrub-ext/issues"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-issue-opened"
          data-size="large"
          data-show-count="true"
          aria-label="Issue prathercc/discrub-ext on GitHub"
        >
          Issue
        </GitHubButton>
      </Box>

      <Box
        sx={{
          position: "fixed",
          top: "250px",
          left: "270px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc/discrub-ext"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-star"
          data-size="large"
          data-show-count="true"
          aria-label="Star prathercc/discrub-ext on GitHub"
        >
          Star
        </GitHubButton>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: "250px",
          left: "165px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc/discrub-ext/subscription"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-eye"
          data-size="large"
          data-show-count="true"
          aria-label="Watch prathercc/discrub-ext on GitHub"
        >
          Watch
        </GitHubButton>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: "285px",
          left: "115px",
        }}
      >
        <GitHubButton
          href="https://github.com/prathercc"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-size="large"
          data-show-count="true"
          aria-label="Follow @prathercc on GitHub"
        >
          Follow @prathercc
        </GitHubButton>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: "250px",
          left: "75px",
        }}
      >
        <GitHubButton
          href="https://github.com/sponsors/prathercc"
          data-color-scheme="no-preference: light; light: dark_high_contrast; dark: dark_dimmed;"
          data-icon="octicon-heart"
          data-size="large"
          aria-label="Sponsor @prathercc on GitHub"
        >
          Sponsor
        </GitHubButton>
      </Box>
    </>
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
  border-radius: 15px;
  width: 180px;
  margin: auto;
  pointer-events: none;
  animation: ${logoAnim} infinite 55s both;
`;

export default About;
