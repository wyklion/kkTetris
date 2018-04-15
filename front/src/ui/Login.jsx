import {
   FormControl,
   FormControlLabel,
   FormGroup,
   // FormHelperText,
   FormLabel,
} from 'material-ui/Form';
import Input from 'material-ui/Input';

import Button from 'material-ui/Button';
// import Checkbox from 'material-ui/Checkbox';
import PropTypes from 'prop-types';
import React from 'react';
// import teal from 'material-ui/colors/teal';
import purple from 'material-ui/colors/purple';
import { withStyles } from 'material-ui/styles';

import http from '../util/http.js';

var color = purple;

const styles = theme => ({
   form: {
      position: 'fixed',
      width: '300px',
      height: '400px',
      left: '50%',
      top: '50%',
      marginLeft: '-150px',
      marginTop: '-200px'
   },
   formLabel: {
      color: '#00acc1',
      fontFamily: 'Arial',
      fontWeight: 'bolder',
      textAlign: 'center',
      fontSize: '30px',
      marginBottom: '30px'
   },
   container: {
      display: 'flex',
      flexWrap: 'wrap',
   },
   controlLabel: {
      marginLeft: 0,
      marginRight: 0,
   },
   input: {
      width: '400px',
      // color: color[500],
      margin: theme.spacing.unit,
      textAlign: 'center'
   },
   button: {
      // backgroundColor: color[600],
      // color: color[200],
      width: '200px',
      left: '50%',
      marginLeft: '-100px',
      marginTop: '20px'
   }
});

class Login extends React.Component {
   state = {
      register: false,
   };

   onKeyDown = (event) => {
      // 回车
      if (event.keyCode === 13) {
         if (this.state.register) {
            this.onRegisterClick();
         } else {
            this.onLoginClick();
         }
      }
   }

   onLoginClick = () => {
      var id = this.name.value;
      var pswd = this.password.value;
      http.post({ url: 'login', data: { id: id, pswd: pswd } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.props.onLogin(result);
         }
      })
   }

   onLoginUIClick = () => {
      this.setState({ register: false });
   }
   onRegisterUIClick = () => {
      this.setState({ register: true });
   }

   onRegisterClick = () => {
      var id = this.id.value;
      var name = this.name.value;
      var pswd = this.password.value;
      var pswd2 = this.password2.value;
      if (pswd != pswd2) {
         alert('两次密码不一致！')
         return;
      }
      http.post({ url: 'register', data: { id: id, name: name, pswd: pswd } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            this.setState({ register: false });
         }
      })
   }

   makeLoginForm() {
      const { classes } = this.props;
      return (
         <FormControl fullWidth={true} component="fieldset">
            <FormLabel className={classes.formLabel} component="legend">KK Tetris</FormLabel>
            <FormControlLabel
               key="loginId"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.name = instance}
                     placeholder="帐号"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <FormControlLabel
               key="loginPswd"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.password = instance}
                     placeholder="密码"
                     type="password"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <Button
               key="loginButton"
               className={classes.button}
               onClick={this.onLoginClick}
               variant="raised"
               color="primary">
               登录
            </Button>
            <Button
               key="registerUIButton"
               color="primary"
               className={classes.button}
               onClick={this.onRegisterUIClick}
            >
               注册
            </Button>
         </FormControl>
      )
   }

   makeRegisterForm() {
      const { classes } = this.props;
      return (
         <FormControl fullWidth={true} component="fieldset">
            <FormLabel className={classes.formLabel} component="legend">KK Tetris</FormLabel>
            <FormControlLabel
               key="regesterId"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.id = instance}
                     placeholder="帐号"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <FormControlLabel
               key="regesterName"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.name = instance}
                     placeholder="昵称"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <FormControlLabel
               key="regesterPswd"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.password = instance}
                     placeholder="密码"
                     type="password"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <FormControlLabel
               key="regesterPswd2"
               className={classes.controlLabel}
               control={
                  <Input
                     onKeyDown={this.onKeyDown}
                     inputRef={(instance) => this.password2 = instance}
                     placeholder="重复密码"
                     type="password"
                     className={classes.input}
                     inputProps={{
                        'aria-label': 'Description',
                     }}
                  />
               }
            />
            <Button
               key="registerButton"
               className={classes.button}
               onClick={this.onRegisterClick}
               variant="raised"
               color="primary">
               注册
            </Button>
            <Button
               key="registerUIButton"
               color="primary"
               className={classes.button}
               onClick={this.onLoginUIClick}
            >
               登录
            </Button>
         </FormControl>
      )
   }

   render() {
      const { classes } = this.props;
      var form = this.state.register ? this.makeRegisterForm() : this.makeLoginForm();
      return (
         <div className={classes.form} >
            {form}
         </div>
      );
   }
}

Login.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login); 