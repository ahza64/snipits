// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

// URLs
import { deleteUserUrl } from '../../../config';

export default class DeleteUserDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      deleting: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {;
    this.setState({
      deleting: true
    });

    let url = deleteUserUrl.replace(':id', this.props.userId);
    request
    .delete(url)
    .query({ role: this.props.role })
    .withCredentials()
    .end(err => {
      this.setState({
        deleting: false
      });
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true);
      }
    });
  }

  renderCircularProgress() {
    if (this.state.deleting) {
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
        primary={ true }
        keyboardFocused={ true }
        onTouchTap={ (event) => this.props.onClose(false) }
      />,
      <RaisedButton
        label="Confirm"
        keyboardFocused={ false }
        disabled={ this.state.deleting }
        onTouchTap={ (event) => this.handleSubmit(event) }
      />
    ];

    return (
        <Dialog
          title="Delete User"
          actions={ actions }
          modal={ true }
          open={ this.props.open } >
          <div>
            Do you really want to delete user <b>"{ this.props.username }"</b> ?
            { this.renderCircularProgress() }
          </div>
        </Dialog>
    );
  }
}
