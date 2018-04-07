import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';

import http from '../util/http.js';

const styles = {
   root: {
      flexGrow: 1,
   },
   flex: {
      flex: 1,
   },
   menuButton: {
      marginLeft: -12,
      marginRight: 20,
   },
};

class HeadBar extends React.Component {
   state = {
      auth: true,
      anchorEl: null,
   };

   handleMenu = event => {
      this.setState({ anchorEl: event.currentTarget });
   };

   handleClose = () => {
      this.setState({ anchorEl: null });
   };

   handleLogout = () => {
      this.setState({ anchorEl: null });
      http.get({ url: 'logout' }, (err, result) => {
         this.props.onLogout();
      })
   }

   render() {
      const { classes } = this.props;
      const { auth, anchorEl } = this.state;
      const open = Boolean(anchorEl);

      return (
         <div className={classes.root}>
            <AppBar position="static">
               <Toolbar>
                  <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                     <MenuIcon />
                  </IconButton>
                  <Typography variant="title" color="inherit" className={classes.flex}>
                     KK俄罗斯方块
                  </Typography>
                  {auth && (
                     <div>
                        <IconButton
                           aria-owns={open ? 'menu-appbar' : null}
                           aria-haspopup="true"
                           onClick={this.handleMenu}
                           color="inherit"
                        >
                           <AccountCircle />
                        </IconButton>
                        <Menu
                           id="menu-appbar"
                           anchorEl={anchorEl}
                           anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                           }}
                           transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                           }}
                           open={open}
                           onClose={this.handleClose}
                        >
                           <MenuItem onClick={this.handleClose}>个人</MenuItem>
                           <MenuItem onClick={this.handleLogout}>退出</MenuItem>
                        </Menu>
                     </div>
                  )}
               </Toolbar>
            </AppBar>
         </div>
      );
   }
}

HeadBar.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HeadBar);