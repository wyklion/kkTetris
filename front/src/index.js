import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import theme from './ui/Theme';
import { MuiThemeProvider } from 'material-ui/styles';
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
   <MuiThemeProvider theme={theme}>
      <BrowserRouter>
         <App />
      </BrowserRouter>
   </MuiThemeProvider>,
   document.getElementById('root')
);
