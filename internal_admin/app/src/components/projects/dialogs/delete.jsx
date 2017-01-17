// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

// URLs
import { projectUrl, deleteProjectUrl } from '../../../config';

export default class DeleteProjectDialog extends React.Component {
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

    let url = deleteProjectUrl.replace(':id', this.props.projectId);
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
          title="Delete Work Project"
          actions={ actions }
          modal={ true }
          open={ this.props.open } >
          <div>
            Do you really want to delete work project <b>"{ this.props.projectName }"</b> ?
            { this.renderCircularProgress() }
          </div>
        </Dialog>
    );
  }
}
