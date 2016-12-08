// Modules
import React from 'react';
import * as request from 'superagent';

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
      creating: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleProjectNameChanged(event) {
    var name = event.target.value;
    if (this.props.value) {
      this.props.value = name;
    }
    this.setState({
      projectName: name
    });
  }

  isConfirmButtonDisabled() {
    if (this.state.creating) {
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
            onChange={ (event) => this.handleProjectNameChanged(event) } />
          { this.renderCircularProgress() }
        </Dialog>
    );
  }
}
