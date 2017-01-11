// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import Toggle from 'material-ui/Toggle';
import EmailsList from './emailsList';

import { configUrl } from '../../../config';

// Constants
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';

export default class EditConfigDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      configId: null,
      configType: '',
      configStatus: STATUS_ACTIVE,
      configDescription: '',
      saving: false,
      configTypeError: null,
      emails: [],
      emailsListChanged: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  loadProps(props) {
    var emails = [];
    if (props.watchers) {
      emails = props.watchers.map(function(w){
        return w.email;
      });
    }
    this.setState({
      configType: props.fileType ? props.fileType : '',
      configStatus: props.status ? props.status : STATUS_ACTIVE,
      configDescription: props.description ? props.description : '',
      configId: props.configId,
      configTypeError: null,
      emails: emails,
      emailsListChanged: false
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      this.loadProps(nextProps);
    }
  }

  validateConfigType(configType) {
    var configTypeError = null;
    if ((configType) && (configType.length > 0)) {
      var correct = configType.match( /^[\w\.]+$/g );
      configTypeError = correct ? null : 'Allowed characters: alphanumeric, \'_\' and \'.\'';
    }
    this.setState({
      configType: configType,
      configTypeError: configTypeError
    });
  }

  handleConfigTypeChanged(event) {
    var configType = event.target.value;
    this.validateConfigType(configType);
  }

  handleConfigDescriptionChanged(event) {
    var description = event.target.value;
    this.setState({
      configDescription: description
    });
  }

  isConfirmButtonDisabled() {
    if (this.state.creating || this.state.configTypeError) {
      return true;
    } else {
      var configType = this.state.configType;
      return !((configType) && (configType.length>0));
    }
  }

  handleSubmit(event) {
    this.setState({
      saving: true
    });

    var config = {
      id: this.state.configId,
      fileType: this.state.configType,
      description: this.state.configDescription,
      status: this.state.configStatus,
      companyId: this.props.companyId,
      workProjectId: this.props.projectId,
      watchers: this.state.emailsListChanged ? this.state.emails : null
    };

    request
    .post(configUrl)
    .send(config)
    .withCredentials()
    .end(err => {
      this.setState({
        saving: false
      });
      if (err) {
        console.error(err);
        if (err.status === 409) {
          this.setState({
            configTypeError: 'Configuration Type Already Exists'
          });
        }
      } else {
        this.props.onClose(true);
      }
    });
  }

  handleWathersListChanged(emails) {
    this.setState({
      emails: emails,
      emailsListChanged: true
    });
  }

  toggleConfigStatus(event, active) {
    this.setState({
      configStatus: active ? STATUS_ACTIVE : STATUS_INACTIVE
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
        disabled={ this.isConfirmButtonDisabled() }
        onTouchTap={ (event) => this.handleSubmit(event) }
      />
    ];

    return (
        <Dialog
          title={ this.props.title }
          actions={ actions }
          modal={ true }
          open={ this.props.open }
          autoScrollBodyContent={ true }
          contentStyle={ { maxWidth: '600px' } } >
          <table style={ { width: '100%' } }>
            <tbody>
              <tr>
                <td>Work Project { this.renderCircularProgress() }</td>
                <td>
                  <TextField
                    name="projectName"
                    disabled={ true }
                    fullWidth={ true }
                    value={ this.props.projectName } />
                </td>
              </tr>
              <tr>
                <td>Configuration Type</td>
                <td>
                  <TextField autoFocus
                    name="configType"
                    hintText="Enter Configuration Type"
                    fullWidth={ true }
                    disabled={ this.state.configId ? true : false }
                    value={ this.state.configType }
                    errorText={ this.state.configTypeError }
                    onChange={ (event) => this.handleConfigTypeChanged(event) } />
                </td>
              </tr>
              <tr>
                <td>Watchers</td>
                <td>
                  <EmailsList
                    emails={ this.state.emails }
                    onChange={ (emails) => this.handleWathersListChanged(emails) } />
                </td>
              </tr>
              <tr>
                <td>Active/Diactive</td>
                <td>
                  <Toggle
                    defaultToggled={ this.state.configStatus === STATUS_ACTIVE }
                    onToggle={ (event, active) => this.toggleConfigStatus(event, active) }
                  />
                </td>
              </tr>
              <tr>
                <td>Description</td>
                <td>
                  <TextField
                    hintText="Enter Configuration Description"
                    multiLine={ true }
                    rows={ 1 }
                    rowsMax={ 4 }
                    fullWidth={ true }
                    value={ this.state.configDescription }
                    onChange={ (event) => this.handleConfigDescriptionChanged(event) } />
                </td>
              </tr>
            </tbody>
          </table>
        </Dialog>
    );
  }
}
