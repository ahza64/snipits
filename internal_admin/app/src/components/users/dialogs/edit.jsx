// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

// URLs
import { userUrl } from '../../../config';

import validator from 'validator';

// Constants
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';
const INIT_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirm: '',
  role: 'CU',
  emailError: null,
  passwordError: null,
  confirmError: null,
  saving: false
};

export default class EditUserDialog extends React.Component {

  constructor() {
    super();
    this.state = INIT_STATE;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      this.setState(INIT_STATE);
    }
  }

  saveUser() {
    var role = this.props.role ? this.props.role : this.state.role;
    role = (role !== 'CU') ? role : null;

    var user = {
      firstname: this.state.firstName,
      lastname: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      companyId: (role !== 'DA') ? this.props.companyId : null,
      role: role
    };

    request
    .post(userUrl)
    .send(user)
    .withCredentials()
    .end(err => {
      this.setState({
        saving: false
      });
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true);
      }
    });
  }

  handleSubmit(event) {
    var emailError = null;
    if (this.state.email === '') {
      emailError = 'This field is required';
    } else {
      if (!validator.isEmail(this.state.email)) {
        emailError = 'Incorrect email address';
      }
    }

    var passwordError = (this.state.password === '') ? 'This field is required' : null;

    var confirmError = null;
    if (this.state.password !== this.state.confirm) {
      confirmError = 'Password does not match';
    }

    var errorsFound = emailError || passwordError || confirmError;

    this.setState({
      emailError: emailError,
      passwordError: passwordError,
      confirmError: confirmError,
      saving: !errorsFound
    });

    if (!errorsFound) {
      this.saveUser();
    }
  }

  handleFirstNameChanged(event) {
    var firstName = event.target.value;
    this.setState({
      firstName: firstName
    });
  }

  handleLastNameChanged(event) {
    var lastName = event.target.value;
    this.setState({
      lastName: lastName
    });
  }

  handleEmailChanged(event) {
    var email = event.target.value;
    this.setState({
      email: email,
      emailError: null
    });
  }

  handleRoleChanged(event) {
    var role = event.target.value;
    this.setState({
      role: role
    });
  }

  handlePasswordChanged(event) {
    var password = event.target.value;
    this.setState({
      password: password,
      passwordError: null
    });
  }

  handleConfirmChanged(event) {
    var confirm = event.target.value;

    var confirmError = this.state.confirmError;
    if (confirm === this.state.password) {
      confirmError = null;
    }

    this.setState({
      confirm: confirm,
      confirmError: confirmError
    });
  }

  renderCircularProgress() {
    if (this.state.saving) {
      return(
        <CircularProgress size={ 0.5 } hidden={ true } />
      );
    } else {
      return;
    }
  }

  render() {
    const actions = [
      <RaisedButton
        label="Cancel"
        onTouchTap={ (event) => this.props.onClose(false) }
      />,
      <RaisedButton
        label="Confirm"
        primary={ true }
        keyboardFocused={ false }
        disabled={ this.state.saving }
        onTouchTap={ (event) => this.handleSubmit(event) }
      />
    ];

    return (
        <Dialog
          title={ this.props.title }
          actions={ actions }
          modal={ true }
          open={ this.props.open }
          contentStyle={ { maxWidth: '800px' } }
          autoScrollBodyContent={ true } >
          <table style={ { width: '100%', marginTop: '10px' } }>
            <tbody>
              <tr>
                <td>First Name</td>
                <td style={ { paddingRight: '30px' } }>
                  <TextField
                    name="firstName"
                    fullWidth={ true }
                    value={ this.state.firstName }
                    onChange={ (event) => this.handleFirstNameChanged(event) }/>
                </td>
                <td>Last Name</td>
                <td>
                  <TextField
                    name="lastName"
                    fullWidth={ true }
                    value={ this.state.lastName }
                    onChange={ (event) => this.handleLastNameChanged(event) } />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td style={ { paddingRight: '30px' } }>
                  <TextField
                    name="email"
                    fullWidth={ true }
                    value={ this.state.email }
                    errorText={ this.state.emailError }
                    onChange={ (event) => this.handleEmailChanged(event) } />
                </td>
                <td>
                  { this.renderCircularProgress() }
                </td>
                <td />
              </tr>
              <tr>
                <td>Company</td>
                <td style={ { paddingRight: '30px' } }>
                  <TextField
                    name="company"
                    fullWidth={ true }
                    disabled={ true }
                    value={ this.props.companyName } />
                </td>
                <td />
                <td />
              </tr>
              <tr>
                <td>Role</td>
                <td style={ { paddingRight: '30px' } }>
                  <SelectField
                    fullWidth={ true }
                    disabled={ this.props.role ? true : false }
                    value={ this.props.role ? this.props.role : this.state.role }
                    onChange={ (event) => this.handleRoleChanged(event) } >
                    <MenuItem value="CU" primaryText="CU" />
                    <MenuItem value="DI" primaryText="DI" />
                    <MenuItem value="DA" primaryText="DA" />
                  </SelectField>
                </td>
                <td />
                <td />
              </tr>
              <tr>
                <td>Password</td>
                <td style={ { paddingRight: '30px' } }>
                  <TextField
                    name="password"
                    fullWidth={ true }
                    type="password"
                    value={ this.state.password }
                    errorText={ this.state.passwordError }
                    onChange={ (event) => this.handlePasswordChanged(event) } />
                </td>
                <td>Confirm</td>
                <td>
                  <TextField
                    name="confirm"
                    fullWidth={ true }
                    type="password"
                    value={ this.state.confirm }
                    errorText={ this.state.confirmError }
                    onChange={ (event) => this.handleConfirmChanged(event) } />
                </td>
              </tr>
            </tbody>
          </table>
        </Dialog>
    );
  }
}
