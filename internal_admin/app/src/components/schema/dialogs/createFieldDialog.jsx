// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';
import AddBoxIcon from 'material-ui/svg-icons/content/add-box';
import SaveIcon from 'material-ui/svg-icons/content/save';
// Modules
// import request from '../../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';

import Row from 'react-bootstrap/lib/Row';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';


export default class CreateRowDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.isConfirmButtonDisabled = this.isConfirmButtonDisabled.bind(this);
    this.handleFieldNameChange = this.handleFieldNameChange.bind(this);
    this.handleAddRowsDialogClose = this.handleAddRowsDialogClose.bind(this);
    this.validateFieldName = this.validateFieldName.bind(this);
  }

  validateFieldName(name){

  }

  componentDidMount(){
    console.log('Row states', this.state);
  }

  handleSubmit(event){
    console.log(event);
  }

  isConfirmButtonDisabled(){
    return (
      false
    );
  }

  handleAddRowsDialogClose(){

  }

  handleFieldNameChange(event){
    console.log(event.target.value);
  }

  render(){
    const validTypes = ['Integer', 'Double', 'String', 'Boolean', 'Other']
    const actions = [
      <RaisedButton
        label="Cancel"
        onTouchTap={ (event) => this.props.onClose(false) }
      />,
      <RaisedButton
        label="Save"
        labelPosition="after"
        primary={ true }
        keyboardFocused={ false }
        disabled={ this.isConfirmButtonDisabled() }
        onTouchTap={ (event) => this.handleSubmit(event) }
      />
    ];

    return(
      <Dialog
        modal={ true }
        actions = {actions}
        open= { this.props.open }
        >
        <div>
          For schema: {this.props.schemaName}
        </div>
        <TextField
          floatingLabelText='Field Name'
          hintText='hint!'
          onChange={ (event) => this.handleFieldNameChange(event) }
          />
      </Dialog>
    )
  }
}
