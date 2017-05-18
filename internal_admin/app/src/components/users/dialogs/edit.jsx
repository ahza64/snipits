// Modules
import React from 'react';
import request from '../../../services/request';

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
import passwordValidator from 'password-validator';

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
const passValidation = new passwordValidator();
passValidation.is().min(6);

export default class EditUserDialog extends React.Component {

  constructor() {
    super();
    this.state = INIT_STATE;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      var user = nextProps.user;
      var newState = JSON.parse(JSON.stringify(INIT_STATE));
      if ((!nextProps.user.companyId) && (nextProps.companies)) {
        if (nextProps.companies.length > 0) {
          newState.companyId = nextProps.companies[0].id;
        }
      }
      if (user.id) {
        var nameSeparatorIndex = user.name.indexOf(' ');
        if (nameSeparatorIndex >= 0) {
          newState.firstName = user.name.substring(0, nameSeparatorIndex);
          newState.lastName = user.name.substring(nameSeparatorIndex+1, user.name.length);
        } else {
          newState.firstName = user.name;
        }
        newState.email = user.email;
        newState.password = 'password';
        newState.confirm = 'password';
      }
      if (user.role) {
        newState.role = user.role;
      }
      if (user.companyId) {
        newState.companyId = user.companyId;
      }
      this.setState(newState);
    }
  }

  saveUser() {
    var role = this.state.role;
    role = (role !== 'CU') ? role : null;
    var companyId = this.state.companyId;
    var password = this.state.password;
    var userId = this.props.user.id;
    if ((userId) && (password === 'password')) {
      password = null;
    }

    var user = {
      id: userId,
      firstname: this.state.firstName,
      lastname: this.state.lastName,
      email: this.state.email,
      password: password,
      companyId: (role !== 'DA') ? companyId : null,
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
    if (!passValidation.validate(this.state.password)) {
      passwordError = 'Password must have 6 charaters minimum';
    }

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

  handleRoleChanged(event, value) {
    this.setState({
      role: value
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
        <CircularProgress size={ 20 } hidden={ true } />
      );
    } else {
      return;
    }
  }

  handleCompanySelectChanged(event, value) {
    this.setState({
      companyId: value
    });
  }

  renderCompanySelectField() {
    if (this.state.role === 'DA') {
      return(
        <TextField
          name="dispatchr"
          fullWidth={ true }
          value="Dispatchr"
          disabled={ true }/>
      );
    } else {
      return(
        <SelectField
          fullWidth={true}
          value={ this.state.companyId }
          disabled={ (this.props.user.companyId || this.props.user.id) ? true : false }
          onChange={ (event, index, value) => this.handleCompanySelectChanged(event, value) } >
          { this.props.companies.map((company, idx) => {
              return(
                <MenuItem key={ idx } value={ company.id } primaryText={ company.name } />
              );
            })
          }
        </SelectField>
      );
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
                  { this.renderCompanySelectField() }
                </td>
                <td />
                <td />
              </tr>
              <tr>
                <td>Role</td>
                <td style={ { paddingRight: '30px' } }>
                  <SelectField
                    fullWidth={ true }
                    disabled={ (this.props.user.role || this.props.user.id) ? true : false }
                    value={ this.state.role }
                    onChange={ (event, index, value) => this.handleRoleChanged(event, value) } >
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
