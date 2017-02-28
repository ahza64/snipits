
import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

export default class EditTaxonomyDialog extends React.Component {

  componentWillMount() {
    console.log("tax dialog will mount");
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
      />
    ];

    return (
      <Dialog
        title={ this.props.title }
        actions={ actions }
        open={ this.props.open }
        modal={ true }
        autoScrollBodyContent={ true }
        contentStyle={ { maxWidth: '600px' } }>
        <table style={ { width: '100%'} }>
          <tbody>
            <tr>
              <td>
                Hi
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}
