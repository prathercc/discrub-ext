import { Box } from "@mui/material";
import React from "react";
import FloatingLogoStyles from "./FloatingLogo.styles";
import styled, { keyframes } from "styled-components";

const FloatingLogo = () => {
  const classes = FloatingLogoStyles();
  return (
    <Box className={classes.box}>
      <CusImg src="discrub2.png" />
    </Box>
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
  border-radius: 5px;
  width: 26px;
  margin: auto;
  pointer-events: none;
  animation: ${logoAnim} infinite 55s both;
`;

export default FloatingLogo;
