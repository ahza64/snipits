// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import SelectField from 'material-ui/SelectField';
import Row from 'react-bootstrap/lib/Row';
import Checkbox from 'material-ui/Checkbox'
import schemaRedux from '../../../reduxes/schema';
import request from '../../../services/request';
import { configUrl, schemaFieldUrl } from '../../../config';

export default class CreateFieldDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      schemaId: null,
      snackBarOpen: 0,
      createDisabled: true,
      required: false,
      type: ''
    };
    this.handleTypeChanged = this.handleTypeChanged.bind(this);
    this.validName = this.validName.bind(this);
    this.validate = this.validate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChanged = this.handleNameChanged.bind(this);
  }

  componentDidMount(){

  }

  validate(){
    if (this.validName() && this.state.type) {
      return true
    }
    return false;
  }

  validName(){
    return this.state.name.match(/^[\w\.]+$/g);
  }

  handleNameChanged(event){
    this.setState({name: event.target.value})
  }

  addField(){

  }

  handleSubmit(){
    var newField = {
      name: this.state.name,
      required: this.state.required,
      type: this.state.type
    }
    let url = schemaFieldUrl.replace(':schemaFieldId', schemaRedux.getState());
    request
    .post(url)
    .send(newField)
    .withCredentials()
    .end((err,res)=>{
      if(err){
        console.error(err);
      } else {
        this.props.onClose(true);
      }
    })
  }

  handleTypeChanged(event, index, type){
    this.setState({
      type: type
    })
  }

  render(){
    const actions = [
      <RaisedButton
        label="Create"
        primary={ true }
        disabled={ !this.validate() }
        onClick={ this.handleSubmit }
        />,
      <FlatButton
        label="Cancel"
        default={ true }
        onClick={(event)=>this.props.onClose(false)}
        />
    ];
    const dataTypes = [
      'Integer', 'Float', 'Boolean', 'String', 'Date', 'JSON', 'GeoCoordinates', 'JPEG'
    ];
    return(
        <Dialog
          title="Add New Schema Field"
          open= { this.props.open }
          actions= { actions }
          >
            <TextField
              hintText="Enter a Field Name"
              value= {this.state.name}
              floatingLabelText="Field Name"
              onChange={(event)=>{this.handleNameChanged(event)}}
            />
            <SelectField
              floatingLabelText="Data Type"
              fullWidth={ true }
              hintText="Field Type"
              value={ this.state.type }
              onChange={ (event, index, value) => this.handleTypeChanged(event, index, value) }
              >
              {
                dataTypes.map((type, idx) => {
                return (
                  <MenuItem
                    key={ idx }
                    value={ type }
                    primaryText={ type }/>
                  );
              })
            }
            </SelectField>
            <Checkbox
              label="Required Field?"
              defaultChecked={ false }
              onCheck={ (event, isChecked) => { this.setState({required : isChecked}) } }
              />
            <Snackbar
              open={ false }
              message="Error! Field name already exists."
              autoHideDuration={5000}
              />
        </Dialog>
    );
  }
}
