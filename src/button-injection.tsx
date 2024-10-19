import React from 'react';
import ReactDOM from 'react-dom/client';
import DiscrubButton from './containers/discrub-button/discrub-button';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

let injectionButton = document.getElementById('button_injection');
if (!injectionButton) {
  injectionButton = document.createElement('div');
  injectionButton.id = 'button_injection';
  document.body.appendChild(injectionButton);
}

ReactDOM.createRoot(injectionButton).render(
  <ThemeProvider theme={theme}>
    <DiscrubButton />
  </ThemeProvider>
);
