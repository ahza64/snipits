
import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class EditTaxValueDialog extends React.Component {

  renderParentIdSelectField() {
    if(this.props.taxFieldValueId !== 1) {
      return(
        <tr>
          <td>Select Parent Id</td>
          <td>
            <TextField
              name="selectParentId"
              fullWidth={ true }
              disabled={ true }
              value={ this.props.taxParentList }
              />
          </td>
        </tr>
      )
    }
  }

  render() {
    const actions = [
      <RaisedButton
        label="Cancel"
        onClick={ (event) => this.props.onClose(false) }
        />
    ];

    return(
      <Dialog
        title={ this.props.title }
        modal={ true }
        open={ this.props.open }
        contentStyle={ { maxWidth: '600px' } }
        autoScrollBodyContent={ true }
        actions={ actions }
        >
        <table style={ { width: '100%' } }>
          <tbody>
            <tr>
              <td>Taxonomy Field Name</td>
              <td>
                <TextField
                  name="taxFieldName"
                  fullWidth={ true }
                  disabled={ true }
                  value={ this.props.taxFieldName }
                  />
              </td>
            </tr>
            { this.renderParentIdSelectField() }
          </tbody>
        </table>
      </Dialog>
    );
  }
}
