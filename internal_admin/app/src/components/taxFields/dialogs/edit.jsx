
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';

import { taxFieldsUrl } from '../../../config';

export default class EditTaxValueDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      parentFieldId: '',
      taxParentList: []
    }
  }

  componentWillReceiveProps() {
    this.setState({
      taxParentList: this.props.taxParentList,
      parentFieldId: this.props.taxParentList[0] ? this.props.taxParentList[0].id : ""
    })
  }

  handleParentNameChange(event, value) {
    let pValue = value;
    this.setState({
      parentFieldId: pValue
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
              value={ this.state.parentFieldId }
              onChange={ (event, index, value) => this.handleParentNameChange(event, value) }
              >
              { this.props.taxParentList.map((parent, index) => {
                  return(
                    <MenuItem
                      key={ index }
                      value={ parent.id }
                      primaryText={ parent.fieldValue }
                    />
                  );
                })
              }
            </SelectField>
          </td>
        </tr>
      );
    }
  }

  handleTaxValueSubmit(event) {
    console.log(">>>>>>>>>> tax values for submit", this.props);
    //TODO finish adding data to be posted
    var taxValue = {
      fieldName: '',
      fieldValue: '',
      parentId: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      qowSchemaId: '',
      workProjectId: '',
      companyId: ''
    }

    // TODO add post to API
    request
    .post(taxFieldsUrl)
    .send(taxValue)
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true)
      }
    })
  }

  actions() {
    return(
      [
        <RaisedButton
          label="Cancel"
          onClick={ (event) => this.props.onClose(false) }
        />,
        <RaisedButton
          label="Confirm"
          primary={ true }
          onClick={ (event) => this.handleTaxValueSubmit(event) }
        />
      ]
    )
  }

  render() {
    return(
      <Dialog
        title={ this.props.title }
        modal={ true }
        open={ this.props.open }
        contentStyle={ { maxWidth: '600px' } }
        autoScrollBodyContent={ true }
        actions={ this.actions() }
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
