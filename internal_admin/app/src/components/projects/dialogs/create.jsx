// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';

import { projectUrl } from '../../../config';

export default class CreateProjectDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      projectName: '',
      projectNameError: null,
      creating: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validateProjectName(projectName) {
    var projectNameError = null;
    if ((projectName) && (projectName.length > 0)) {
      var correct = projectName.match( /^[\w\.]+$/g );
      projectNameError = correct ? null : 'Allowed characters: alphanumeric, \'_\' and \'.\'';
    }
    this.setState({
      projectName: projectName,
      projectNameError: projectNameError
    });
  }

  handleProjectNameChanged(event) {
    var name = event.target.value;
    this.validateProjectName(name);
  }

  isConfirmButtonDisabled() {
    if (this.state.creating || this.state.projectNameError) {
      return true;
    } else {
      var name = this.state.projectName;
      return !((name) && (name.length>0));
    }
  }

  handleSubmit(event) {
    this.setState({
      creating: true
    });
    var newProject = {
      name: this.state.projectName,
      companyId: this.props.companyId
    };

    request
    .post(projectUrl)
    .send(newProject)
    .withCredentials()
    .end(err => {
      this.setState({
        creating: false
      });
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true);
      }
    });
  }

  renderCircularProgress() {
    if (this.state.creating) {
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
        disabled={ this.isConfirmButtonDisabled() }
        onTouchTap={ (event) => this.handleSubmit(event) }
      />
    ];

    return (
        <Dialog
          title="Add Work Project"
          actions={ actions }
          modal={ true }
          open={ this.props.open } >
          <div>For company: { this.props.companyName }</div>
          <TextField
            value={ this.state.projectName }
            hintText="Enter New Work Project Name"
            floatingLabelText="Work Project Name"
            errorText={ this.state.projectNameError }
            onChange={ (event) => this.handleProjectNameChanged(event) } />
          { this.renderCircularProgress() }
        </Dialog>
    );
  }
}
