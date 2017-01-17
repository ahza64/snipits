// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

// URLs
import { deleteConfigUrl } from '../../../config';

export default class DeleteConfigDialog extends React.Component {
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

    let url = deleteConfigUrl.replace(':id', this.props.configId);
    request
    .delete(url)
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
          title="Delete Ingestion Configuration"
          actions={ actions }
          modal={ true }
          open={ this.props.open } >
          <div>
            Do you really want to delete ingestion configuration <b>"{ this.props.fileType }"</b> ?
            { this.renderCircularProgress() }
          </div>
        </Dialog>
    );
  }
}
