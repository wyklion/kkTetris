import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import LanguageIcon from 'material-ui-icons/Language';
import Menu, { MenuItem } from 'material-ui/Menu';
import Fade from 'material-ui/transitions/Fade';
import Button from 'material-ui/Button';

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
      fontFamily: 'Roboto,SimHei',
   },
   menuButton: {
      // marginLeft: -12,
      marginRight: 20,
   },
   popperClose: {
      pointerEvents: 'none',
   },
   name: {
      lineHeight: '50px',
   }
};

class HeadBar extends React.Component {
   state = {
      anchorElSetting: null,
      anchorElUser: null,
      openSetting: false,
      openKeyboard: false
   };

   handleMenuOpen(name) {
      return (event) => {
         this.setState({ [name]: event.currentTarget });
      }
   }
   handleMenuClose(name) {
      return (event) => {
         this.setState({ [name]: null });
      }
   }

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
   handleRank = (rankType) => {
      return () => {
         this.setState({ anchorElRank: null });
         gameManager.app.onRank(rankType);
      }
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
      this.setState({ anchorElLang: null });
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
      const { anchorElSetting, anchorElRank, anchorElLang, anchorElUser } = this.state;
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
               <Toolbar style={{ width: width, minHeight: 50, margin: '0 auto', padding: 'unset' }}>
                  <IconButton
                     // className={classes.menuButton}
                     aria-owns={Boolean(anchorElSetting) ? 'settingmenu' : null}
                     aria-haspopup="true"
                     onClick={this.handleMenuOpen('anchorElSetting')}
                     color="inherit"
                  >
                     <MenuIcon />
                  </IconButton>
                  <Menu
                     id="settingmenu"
                     anchorEl={anchorElSetting}
                     getContentAnchorEl={null}
                     anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                     }}
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                     }}
                     transition={Fade}
                     open={Boolean(anchorElSetting)}
                     onClose={this.handleMenuClose('anchorElSetting')}
                  >
                     <MenuItem onClick={this.handleSetting}>{lang.get('Setting')}</MenuItem>
                     <MenuItem onClick={this.handleKeyboardSetting}>{lang.get('Keyboard Setting')}</MenuItem>
                  </Menu>

                  <Button
                     // className={classes.menuButton}
                     size="large"
                     aria-owns={Boolean(anchorElRank) ? 'rankmenu' : null}
                     aria-haspopup="true"
                     onClick={this.handleMenuOpen('anchorElRank')}
                     color="inherit"
                  >
                     <Typography variant="subheading" color="inherit" >
                        {lang.get('Leaderboard')}
                     </Typography>
                  </Button>
                  <Menu
                     id="rankmenu"
                     anchorEl={anchorElRank}
                     getContentAnchorEl={null}
                     anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                     }}
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                     }}
                     transition={Fade}
                     open={Boolean(anchorElRank)}
                     onClose={this.handleMenuClose('anchorElRank')}
                  >
                     <MenuItem onClick={this.handleRank('speed40')}>{lang.get('Sprint 40L')}</MenuItem>
                     <MenuItem onClick={this.handleRank('dig18')}>{lang.get('Dig Race 18L')}</MenuItem>
                  </Menu>

                  <Typography variant="title" color="inherit" className={classes.flex}>
                     {lang.get('KK TETRIS')}
                  </Typography>

                  <IconButton
                     className={classes.menuButton}
                     aria-owns={Boolean(anchorElLang) ? 'langmenu' : null}
                     aria-haspopup="true"
                     onClick={this.handleMenuOpen('anchorElLang')}
                     color="inherit"
                  >
                     <LanguageIcon />
                  </IconButton>
                  <Menu
                     id="langmenu"
                     anchorEl={anchorElLang}
                     getContentAnchorEl={null}
                     anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                     }}
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                     }}
                     transition={Fade}
                     open={Boolean(anchorElLang)}
                     onClose={this.handleMenuClose('anchorElLang')}
                  >
                     <MenuItem onClick={this.handleSwitchLang}>{lang.isEn() ? '切换至中文' : 'Switch To English'}</MenuItem>
                  </Menu>

                  <Typography variant="subheading" color="inherit" className={classes.name}>
                     {gameManager.user.nick}
                  </Typography>
                  <IconButton
                     aria-owns={Boolean(anchorElUser) ? 'usermenu' : null}
                     // aria-haspopup="true"
                     onClick={this.handleMenuOpen('anchorElUser')}
                     color="inherit"
                  >
                     <AccountCircle />
                  </IconButton>
                  <Menu
                     id="usermenu"
                     anchorEl={anchorElUser}
                     getContentAnchorEl={null}
                     anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                     }}
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     open={Boolean(anchorElUser)}
                     onClose={this.handleMenuClose('anchorElUser')}
                  >
                     <MenuItem onClick={this.handleProfile}>{lang.get('Profile')}</MenuItem>
                     <MenuItem onClick={this.handleLogout}>{lang.get('Logout')}</MenuItem>
                  </Menu>
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