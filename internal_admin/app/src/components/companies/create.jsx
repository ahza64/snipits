// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';

import { companyUrl } from '../../config';

export default class CreateCompanyDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      companyName: '',
      creating: false
    };
  }

  handleCompanyNameChanged(event) {
    var name = event.target.value;
    if (this.props.value) {
      this.props.value = name;
    }
    this.setState({
      companyName: name
    });
  }

  isConfirmButtonDisabled() {
    if (this.state.creating) {
      return true;
    } else {
      var name = this.state.companyName;
      return !((name) && (name.length>0));
    }
  }

  handleSubmit(event) {
    this.setState({
      creating: true
    });
    var newCompany = { name: this.state.companyName };

    request
    .post(companyUrl)
    .send(newCompany)
    .withCredentials()
    .end(err => {
      this.setState({
        creating: false
      });
      if (err) {
        console.error(err);
      } else {
        this.props.onSubmit(this.state.companyName);
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
        label = "Cancel"
        onTouchTap = { (event) => this.props.onCancel() }
      />,
      <RaisedButton
        label = "Confirm"
        primary = {true}
        keyboardFocused = {false}
        disabled = { this.isConfirmButtonDisabled() }
        onTouchTap = { (event) => this.handleSubmit(event) }
      />
    ];

    return (
        <Dialog
          title = "Create Company"
          actions = { actions }
          modal = { true }
          open = { this.props.open }
        >
          <TextField
            value={ this.state.companyName }
            hintText="Please type new company name"
            floatingLabelText="Company Name"
            onChange={ (event) => this.handleCompanyNameChanged(event) } />
          { this.renderCircularProgress() }
        </Dialog>
    );
  }
}
