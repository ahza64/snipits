// Modules
import React from 'react';
import { Link } from 'react-router';
import Login from './login/login.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Styles
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require('../../styles/app.scss');

injectTapEventPlugin();

export default class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        {this.props.children}
      </MuiThemeProvider>
    );
  };
}
