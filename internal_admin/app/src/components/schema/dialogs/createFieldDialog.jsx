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
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';


import Row from 'react-bootstrap/lib/Row';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';


export default class CreateFieldDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      schemaId: null,
      snackBarOpen: 0
    };

    this.validate = this.validate.bind(this);
    this.showAddRowDialog = this.showAddRowDialog.bind(this);
  }
  showAddRowDialog(){
    this.setState({
      showCreateFieldDialog : true
     });
  }
  validate(){

  }

  render(){
    const actions = [
      <RaisedButton
        label="Create"
        primary={ true }
        disabled={this.props.createDisable}
        onClick={this.handleSubmit}
        />,
      <FlatButton
        label="Cancel"
        secondary={ true }
        onClick={(event) =>{}}
        />
    ];
    const dataTypes = [
      'Integer', 'Float', 'Boolean', 'String', 'Date', 'Other'
    ];
    return(
      <div>
        <RaisedButton
          label="Add Field"
          secondary={true}
          onClick={(event) => { this.showAddRowDialog(event) } }
          />
        <Dialog
          title="Add New Schema Field"
          open= { this.props.createFieldDialogOpen }
          actions= { actions }
          >
            <TextField
              hintText="Field Name"
            />
            <SelectField
              floatingLabelText="Schema Field"
              fullWidth={ true }
              >
              { dataTypes.map((type, idx) => {
                <MenuItem key={ idx } value={ type } />
              } ) }
            </SelectField>
            <Snackbar
              open={ false }
              message="Error! Field name already exists."
              autoHideDuration={5000}
              />
        </Dialog>
      </div>
    )
  }
}
