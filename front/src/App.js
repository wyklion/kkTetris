import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from 'material-ui/Button';
import HeadBar from './ui/HeadBar';
import Login from './ui/Login';

import teal from 'material-ui/colors/teal';
var color = teal;

const classes = {
   bg: {
      // backgroundColor: color[900],
      width: '100%',
      height: '100%',
   }
}
class App extends Component {
   state = {
      logined: false
   }
   render() {
      var state = this.state;
      var logined = state.logined;
      if (!logined) {
         return (
            <div style={classes.bg}>
               <Login />
            </div>
         )
      }
      return (
         <div style={classes.bg} className="App">
            <HeadBar />
         </div>
      );
   }
}

export default App;
