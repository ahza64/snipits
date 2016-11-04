// Modules
import React from 'react';

// Styles
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class FileExistsWarn extends React.Component {
  constructor() {
    super();

    this.state = { open: false };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ open: nextProps.open });
  }

  handleOpen() {
    this.setState({open: true});
  }

  render() {
    const actions = [
      <FlatButton
        label='Close'
        onClick={ this.props.setClose }
      />
    ];

    return (
      <Dialog
        actions={ actions }
        modal={ false }
        open={ this.state.open }
      >
        You can not upload the file with the name that is already existing.
      </Dialog>
    );
  }
}