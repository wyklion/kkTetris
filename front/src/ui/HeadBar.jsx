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
import Fade from 'material-ui/transitions/Fade';

import KeyboardSetting from './KeyboardSetting';
import Setting from './Setting';
import http from '../util/http';
import gameManager from '../game/GameManager';
import lang from '../util/lang';

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
   popperClose: {
      pointerEvents: 'none',
   },
};

class HeadBar extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openSetting: false,
      openKeyboard: false
   };

   handleMenuSetting = event => {
      this.setState({ anchorElSetting: event.currentTarget });
   }

   handleMenuUser = event => {
      this.setState({ anchorElUser: event.currentTarget });
   };

   handleCloseSettingMenu = () => {
      this.setState({ anchorElSetting: null });
   }

   handleCloseUser = () => {
      this.setState({ anchorElUser: null });
   };

   /**
    * 设置
    */
   handleSetting = () => {
      this.setState({ anchorElSetting: null, openSetting: true, openKeyboard: false })
   }
   handleCloseSetting = () => {
      this.setState({ openSetting: false })
   }

   /**
    * 语言切换
    */
   handleSwitchLang = () => {
      if (lang.isEn()) {
         gameManager.changeLang(0);
      } else {
         gameManager.changeLang(1);
      }
      this.setState({ anchorElSetting: null });
   }
   /**
    * 键盘设置
    */
   handleKeyboardSetting = () => {
      this.setState({ anchorElSetting: null, openSetting: false, openKeyboard: true })
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
      var width = this.props.width || '100%';
      return (
         <div className={classes.root}>
            <Setting
               open={this.state.openSetting}
               close={this.handleCloseSetting}
            />
            <KeyboardSetting
               open={this.state.openKeyboard}
               close={this.handleCloseKeyboardSetting}
            />
            <AppBar position="static">
               <Toolbar style={{ width: width, margin: '0 auto', padding: 'unset' }}>
                  < div >
                     <IconButton
                        // className={classes.menuButton}
                        aria-owns={Boolean(anchorElSetting) ? 'settingmenu' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenuSetting}
                        color="inherit"
                     >
                        <MenuIcon />
                     </IconButton>
                     <Menu
                        id="settingmenu"
                        anchorEl={anchorElSetting}
                        anchorOrigin={{
                           vertical: 'top',
                           horizontal: 'right',
                        }}
                        transformOrigin={{
                           vertical: 'bottom',
                           horizontal: 'left',
                        }}
                        transition={Fade}
                        open={Boolean(anchorElSetting)}
                        onClose={this.handleCloseSettingMenu}
                     >
                        <MenuItem onClick={this.handleSetting}>{lang.get('Setting')}</MenuItem>
                        <MenuItem onClick={this.handleKeyboardSetting}>{lang.get('Keyboard Setting')}</MenuItem>
                        <MenuItem onClick={this.handleRank}>{lang.get('Leaderboard')}</MenuItem>
                        <MenuItem onClick={this.handleSwitchLang}>{lang.isEn() ? '切换至中文' : 'Switch To English'}</MenuItem>
                     </Menu>
                  </div>

                  <Typography variant="title" color="inherit" className={classes.flex}>
                     {lang.get('KK Tetris')}
                  </Typography>
                  <div>
                     <span>{gameManager.user.nick}</span>
                     <IconButton
                        aria-owns={Boolean(anchorElUser) ? 'usermenu' : null}
                        // aria-haspopup="true"
                        onClick={this.handleMenuUser}
                        color="inherit"
                     >
                        <AccountCircle />
                     </IconButton>
                     <Menu
                        id="usermenu"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                           vertical: 'top',
                           horizontal: 'left',
                        }}
                        transformOrigin={{
                           vertical: 'top',
                           horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={this.handleCloseUser}
                     >
                        <MenuItem onClick={this.handleProfile}>{lang.get('Profile')}</MenuItem>
                        <MenuItem onClick={this.handleLogout}>{lang.get('Logout')}</MenuItem>
                     </Menu>
                  </div>
               </Toolbar>
            </AppBar>
         </div >
      );
   }
}

HeadBar.propTypes = {
   classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HeadBar);