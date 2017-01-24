// Modules
import React from 'react';
import { Link } from 'react-router';
import Login from './login/login.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import request from '../services/request';
import Snackbar from 'material-ui/Snackbar';
import authRedux from '../reduxes/auth';
import { browserHistory } from 'react-router';

const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;

// Styles
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require('../../styles/app.scss');

injectTapEventPlugin();

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      sessionExpired: false
    };
  }

  componentWillMount() {
    var self = this;
    request.addListener(function(err, res) {
      if (res.status === 401 && self.props.location.pathname !== '/') {
        self.setState({
          sessionExpired: true
        });
      }
    });
  }

  handleRelogin() {
    authRedux.dispatch({
      type: 'LOGOUT'
    });
    this.setState({
      sessionExpired: false
    });
    browserHistory.push(urlPrefix);
  }

  render() {
    console.log('=======> ', this.props.route.path);
    console.log('=======> ', this.props);
    return (
      <MuiThemeProvider>
        <div>
          { this.props.children }
          <Snackbar
            open={ this.state.sessionExpired }
            message="Your session has expired. Please login again."
            action="login"
            onActionTouchTap={ (event) => this.handleRelogin() }
          />
        </div>
      </MuiThemeProvider>
    );
  };
}
