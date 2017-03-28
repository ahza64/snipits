
import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

export default class ValidationDialog extends React.Component {

  actions() {
    return(
      [
        <RaisedButton
          label="Confirm"
          onTouchTap={ (event) => this.props.onClose(false) }
          primary={ true }
        />
      ]
    )
  }

  render() {
    return(
      <Dialog
        title={ "This data conflicts with already exsisting data. Please enter different values" }
        open={ this.props.open }
        actions={ this.actions() }
      >

      </Dialog>
    )
  }
}
