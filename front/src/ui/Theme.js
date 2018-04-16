
import { createMuiTheme } from 'material-ui/styles';

const theme = createMuiTheme({
   palette: {
      type: 'dark',
      // common: {
      //    black: "#000",
      //    white: "#aaa",
      // },
      primary: {
         main: '#00acc1',
         // light: '#5ddef4',
         // dark: '#007c91',
         contrastText: '#000000',
      },
      secondary: {
         main: '#f4511e',
         // light: '#ff844c',
         // dark: '#b91400',
         contrastText: '#ffee58',
      },
      // background: {
      //    paper: "#dddddd",
      //    default: "#666666",
      // }
   },
   status: {
      danger: 'orange',
   },
});

export default theme;