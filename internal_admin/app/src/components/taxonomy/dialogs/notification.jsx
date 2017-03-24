
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

export default class NotificationDialog extends React.Component {

  render() {
    const actions = [
      <RaisedButton
        label="Cancel"
        primary={ true }
        keyboardFocused={ true }
        onTouchTap={ (event) => this.props.onClose(false) }
      />,
      <RaisedButton
        label="Save Changes"
        keyboardFocused={ false }
        onTouchTap={
          (event) => {
            this.props.fetchTaxValues(event);
            this.props.onClose(false);
          }
        }
      />
    ];

    return (
      <Dialog
        title="ALERT!!!"
        open={ this.props.open }
        actions={ actions }
        >
        Are you sure you'd like to make changes to the taxonomy database?
        <h4>any of the exsisting expected taxonomy values will become invaild
          and will need to be reomved using the expected taxonomy page</h4>
      </Dialog>
    )
  }
}
