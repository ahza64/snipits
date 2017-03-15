
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
      parentId: '',
      taxParentList: [],
      fieldValue: ''
    }
  }

  componentWillReceiveProps() {
    this.setState({
      taxParentList: this.props.taxParentList,
      parentId: this.props.taxParentList[0] ? this.props.taxParentList[0].id : ""
    })
  }

  handleTaxValueSubmit(event) {
    console.log(">>>>>>>>>> tax values for submit", this.props);
    //TODO finish adding data to be posted
    var taxValue = {
      fieldName: '',
      fieldValue: this.state.fieldValue,
      parentId: this.state.parentId,
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

  handleParentNameChange(event, value) {
    let pValue = value;
    this.setState({
      parentId: pValue
    });
  }

  handleTaxValueChange(event, value) {
    let tValue = event.target.value;
    this.setState({
      fieldValue: tValue
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
              value={ this.state.parentId }
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
            <tr>
              <td>Taxonomy Field Value</td>
              <td>
                <TextField
                  name="fieldValue"
                  hintText="Taxonomy Value Name"
                  value={ this.state.fieldValue }
                  fullWidth={ true }
                  onChange={ (event) => this.handleTaxValueChange(event) }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}
