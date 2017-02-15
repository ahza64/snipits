// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';



import Row from 'react-bootstrap/lib/Row';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';


export default class CreateFieldDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      showCreateFieldDialog: false,
      snackBarOpen: 0
    };
  }

  render(){
    const actions = [
      <RaisedButton
        label="Create Field"
        primary={true}
        disabled={this.props.createDisable}
        onClick={this.handleSubmit}
        />,
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.props.setDialog}
        />
    ];
    return(
      <div>
        <RaisedButton
          label="Add Field"
          secondary={true}
          onClick={this.props.setOpen}
          />
        <Dialog
          title="Add New Schema Field"
          open = {this.props.open}
          actions = {actions}
          >
          <TextField
            hintText="Field Name"
            />
          <Snackbar
            open={false}
            message="Error! Schema name already exists."
            autoHideDuration={5000}
            />
        </Dialog>
      </div>
    )
  }
}
