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
      companyNameError: null,
      creating: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validateCompanyName(companyName) {
    var companyNameError = null;
    if ((companyName) && (companyName.length > 0)) {
      var correct = companyName.match( /^[a-zA-Z\d\.]+$/g );
      companyNameError = correct ? null : 'Allowed characters: alphanumeric and \'.\'';
    }
    this.setState({
      companyName: companyName,
      companyNameError: companyNameError
    });
  }

  handleCompanyNameChanged(event) {
    var name = event.target.value;
    this.validateCompanyName(name);
  }

  isConfirmButtonDisabled() {
    if (this.state.creating || this.state.companyNameError) {
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
        this.props.onClose(true);
      }
    });
  }

  renderCircularProgress() {
    if (this.state.creating) {
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
          title="Add Company"
          actions={ actions }
          modal={ true }
          open={ this.props.open } >
          <TextField
            value={ this.state.companyName }
            hintText="Enter New Company Name"
            floatingLabelText="Company Name"
            errorText={ this.state.companyNameError }
            onChange={ (event) => this.handleCompanyNameChanged(event) } />
          { this.renderCircularProgress() }
        </Dialog>
    );
  }
}
