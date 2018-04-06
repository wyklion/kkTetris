import {
   FormControl,
   FormControlLabel,
   FormGroup,
   FormHelperText,
   FormLabel,
} from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import PropTypes from 'prop-types';
import React from 'react';
import teal from 'material-ui/colors/teal';
import purple from 'material-ui/colors/purple';
import { withStyles } from 'material-ui/styles';

import http from '../util/http.js';

var color = purple;

const styles = theme => ({
   form: {
      position: 'fixed',
      width: '400px',
      height: '300px',
      left: '50%',
      top: '50%',
      marginLeft: '-200px',
      marginTop: '-150px'
   },
   formLabel: {
      color: color[800],
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
      marginTop: '30px'
   }
});

class Login extends React.Component {
   state = {
      gilad: true,
      jason: false,
      antoine: true,
   };

   handleChange = name => event => {
      this.setState({ [name]: event.target.checked });
   };

   onLoginClick = () => {
      var id = this.name.value;
      var pswd = this.password.value;
      http.post({ url: 'login', data: { id: id, pswd: pswd } }, (err, result) => {
         if (err) {
            alert(err);
         } else {
            console.log(result);
         }
      })
   }
   render() {
      const { classes } = this.props;
      return (
         <div className={classes.form} >
            <FormControl fullWidth={true} component="fieldset">
               <FormLabel className={classes.formLabel} component="legend">KK Tetris</FormLabel>
               <FormGroup>
                  <FormControlLabel
                     control={
                        <Input
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
                     control={
                        <Input
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
               </FormGroup>
               <Button
                  className={classes.button}
                  onClick={this.onLoginClick}
                  variant="raised"
                  color="primary">
                  登录
               </Button>
            </FormControl>
         </div>
      );
   }
}

Login.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login); 