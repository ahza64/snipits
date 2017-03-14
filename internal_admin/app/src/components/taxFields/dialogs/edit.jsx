
import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';

export default class EditTaxValueDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parentFieldName: '',
      taxParentList: []
    }
  }

  componentWillReceiveProps() {
    this.setState({
      taxParentList: this.props.taxParentList,
      parentFieldName: this.props.taxParentList[0] ? this.props.taxParentList[0].id : ""
    })
  }

  handleParentNameChange(event, value) {
    let pValue = value;
    this.setState({
      parentFieldName: pValue
    });
  }

  renderParentIdSelectField() {
    if(this.props.taxFieldValueId !== 1) {
      return(
        <tr>
          <td>Select Parent Value from "{ this.props.parentSelected.fieldName }"</td>
          <td>
            <SelectField
              fullWidth={ true }
              value={ this.state.parentFieldName }
              onChange={ (event, index, value) => this.handleParentNameChange(event, value) }
              >
              { this.props.taxParentList.map((parent, index) => {
                  return(
                    <MenuItem key={ index } value={ parent.id } primaryText={ parent.fieldValue } />
                  );
                })
              }
            </SelectField>
          </td>
        </tr>
      );
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
