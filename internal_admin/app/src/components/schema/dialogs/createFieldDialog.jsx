// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
<<<<<<< HEAD
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';


=======
import Snackbar from 'material-ui/Snackbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

>>>>>>> 6d2e9f0149b5f0c174bcbbd28cb6bf02f7f41655

import Row from 'react-bootstrap/lib/Row';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';


export default class CreateFieldDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
<<<<<<< HEAD
      types: ["Int", "String"],
      dataTypeValue: 0
=======
      schemaId: null,
      snackBarOpen: 0,
      createDisabled: true
>>>>>>> 6d2e9f0149b5f0c174bcbbd28cb6bf02f7f41655
    };

    this.validate = this.validate.bind(this);
    this.showAddRowDialog = this.showAddRowDialog.bind(this);
    this.toggleShowAddFieldDialog = this.toggleShowAddFieldDialog.bind(this);
  }

  showAddRowDialog(){
    this.setState({
      showCreateFieldDialog : true
     });
  }

  toggleShowAddFieldDialog(){
    this.setState({
     });
  }

  componentDidMount(){

  }

  validate(){

  }

  addField(){

  }

  handleSelectDataType(event){
    this.setState({dataTypeValue: event.target.value})
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
        <Dialog
          title="Add New Schema Field"
          open= { this.props.open }
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
    );
  }
}
