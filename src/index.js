// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import { ChakraProvider } from "@chakra-ui/react";
// import theme from './theme';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <ChakraProvider theme={theme}>
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   </ChakraProvider>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from './theme';

// App is light-only now (matches MPS). Clear any stale persisted "dark" so
// returning users don't get a dark header/chrome from a previous session.
try { window.localStorage.setItem('chakra-ui-color-mode', 'light'); } catch (e) {}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
