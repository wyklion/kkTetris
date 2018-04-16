import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Menu, { MenuItem } from 'material-ui/Menu';

import KeyboardSetting from './KeyboardSetting';
import http from '../util/http';
import gameManager from '../game/GameManager';

const styles = {
   root: {
      flexGrow: 1,
   },
   flex: {
      flex: 1,
      fontFamily: 'SimHei',
   },
   menuButton: {
      marginLeft: -12,
      marginRight: 20,
   },
};

class HeadBar extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openKeyboard: false
   };

   handleMenuSetting = event => {
      this.setState({ anchorElSetting: event.currentTarget });
   }

   handleMenuUser = event => {
      this.setState({ anchorElUser: event.currentTarget });
   };

   handleCloseSetting = () => {
      this.setState({ anchorElSetting: null });
   }

   handleCloseUser = () => {
      this.setState({ anchorElUser: null });
   };

   /**
    * 键盘设置
    */
   handleKeyboardSetting = () => {
      this.setState({ anchorElSetting: null, openKeyboard: true })
   }
   handleCloseKeyboardSetting = () => {
      this.setState({ openKeyboard: false })
   }

   /**
    * 排行榜
    */
   handleRank = () => {
      this.setState({ anchorElSetting: null });
      gameManager.app.onRank();
   }

   /**
    * 打开个人信息
    */
   handleProfile = () => {
      this.setState({ anchorElUser: null });
      gameManager.app.onProfile(gameManager.userManager.userId);
   }

   /**
    * 退出登录
    */
   handleLogout = () => {
      this.setState({ anchorEl: null });
      http.get({ url: 'logout' }, (err, result) => {
         this.props.onLogout();
      })
   }

   render() {
      const { classes } = this.props;
      const { anchorElSetting, anchorElUser } = this.state;
      return (
         <div className={classes.root}>
            <KeyboardSetting
               open={this.state.openKeyboard}
               close={this.handleCloseKeyboardSetting}
            />
            <AppBar position="static">
               <Toolbar>
                  <IconButton className={classes.menuButton}
                     color="inherit"
                     aria-label="Menu"
                     onClick={this.handleMenuSetting}
                  >
                     <MenuIcon />
                  </IconButton>
                  <Menu
                     id="menu-appbar"
                     anchorEl={anchorElSetting}
                     anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     open={Boolean(anchorElSetting)}
                     onClose={this.handleCloseSetting}
                  >
                     <MenuItem onClick={this.handleKeyboardSetting}>键盘设置</MenuItem>
                     <MenuItem onClick={this.handleRank}>排行榜</MenuItem>
                  </Menu>
                  <Typography variant="title" color="inherit" className={classes.flex}>
                     KK俄罗斯方块
                  </Typography>
                  <div>
                     <span>{gameManager.user.nick}</span>
                     <IconButton
                        aria-owns={Boolean(anchorElUser) ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenuUser}
                        color="inherit"
                     >
                        <AccountCircle />
                     </IconButton>
                     <Menu
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                           vertical: 'top',
                           horizontal: 'right',
                        }}
                        transformOrigin={{
                           vertical: 'top',
                           horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={this.handleCloseUser}
                     >
                        <MenuItem onClick={this.handleProfile}>个人信息</MenuItem>
                        <MenuItem onClick={this.handleLogout}>退出登录</MenuItem>
                     </Menu>
                  </div>
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