// Modules
const urlPrefix = require('dsp_shared/conf.d/config.json').mooncake.url_prefix;
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import { loginUrl } from '../../config';
import Snackbar from 'material-ui/Snackbar';

// Styles
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import smLogo from '../../../styles/assets/sm-logo.png';
import '../../../styles/logo.scss';
const loginContainerStyle = {
  'borderRadius': 2,
  'height': 250,
  'width': 400,
  'marginTop': 200,
  'textAlign': 'center',
  'display': 'inline-block',
  'padding': 25
};

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      openSnackbar: false
    };
    this.handleLoginEmail = this.handleLoginEmail.bind(this);
    this.handleLoginPassword = this.handleLoginPassword.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleLoginEmail(event) {
    this.setState({
      email: event.target.value,
      openSnackbar: false
    });
  }
  handleLoginPassword(event) {
    this.setState({
      password: event.target.value,
      openSnackbar: false
    });
  }

  handleClick(event) {
    event.preventDefault();

    const loginData = this.state;

    request
    .post(loginUrl)
    .send(loginData)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
        if (err.status === 401 || err.status === 400) {
          this.setState({ openSnackbar: true });
        }
      } else {
        authRedux.dispatch({
          type: 'LOGIN',
          user: res.body
        });
        browserHistory.push(urlPrefix + 'upload/');
      }
    });
  }

  render() {
    return (
      <Row>
        <h1 style={{textAlign: 'center'}}>Ingestion App to upload your project files</h1>
        <Col xs={0} sm={1} md={4} lg={4} ></Col>
        <Col xs={12} sm={10} md={4} lg={4} >
          <Paper style={loginContainerStyle} zDepth={2} rounded={false}>
            <div>
              <img className='sm-logo' src={ smLogo } />
              <div>
                <TextField value={ this.state.email } onChange={ this.handleLoginEmail } hintText='Email Address'/>
              </div>
              <div>
                <TextField value={ this.state.password } onChange={ this.handleLoginPassword } hintText='Password' type='password'/>
              </div>
              <div>
                <RaisedButton keyboardFocused={true} onClick={ this.handleClick } label='USER LOGIN'/>
              </div>
            </div>
          </Paper>
        </Col>
        <Col xs={0} sm={1} md={4} lg={4} ></Col>
        <MuiThemeProvider>
          <div>
            { this.props.children }
            <Snackbar
              open={ this.state.openSnackbar }
              message="Invalid login, please try again."
            />
          </div>
        </MuiThemeProvider>
      </Row>
    );
  }
}
