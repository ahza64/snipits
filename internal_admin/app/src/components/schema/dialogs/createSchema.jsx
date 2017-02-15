import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';

import { configUrl } from '../../../config';

export default class CreateSchema extends React.Component {
  constructor(){
    super();
    this.state = {
      token: "",
      snackbarOpen: false
    };

    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleNameInput(event, value){
    var setCreateDisable = this.props.setCreateDisable;
    if(value.length === 0){
      setCreateDisable(true);
    }
    else setCreateDisable(false);
    this.setState({token:value});
    this.setState({snackbarOpen: false});
  }

  handleSubmit(){
    var addSchema = this.props.addSchema;
    var setDialog = this.props.setDialog;
    var error = 0;

    console.log("searching names");
    console.log(this.state.token)
    for (var i = 0; i < this.props.schemas.length; i++){
      if (this.state.token == this.props.schemas[i].name){
        console.log("error name already exists");
        error = 1;
        this.setState({snackbarOpen: true});
        break;
      }
    }

    if(!error){
    addSchema(this.state.token);
    setDialog();
    }

  }


  render() {

    const actions = [
      <RaisedButton
        label="Create Schema"
        primary={true}
        disabled={this.props.createDisable}
        onClick={this.handleSubmit}
        />,
      <FlatButton
        label="Exit"
        secondary={true}
        onClick={this.props.setDialog}
        />
    ];

    return (
      <div>
        <RaisedButton
          label="Add Schema"
          secondary={true}
          onClick={this.props.setDialog}
          />
        <Dialog
          title="Create New Schema"
          open = {this.props.open}
          actions = {actions}
          >
          <TextField
            hintText="Schema Name"
            onChange={this.handleNameInput}
            />
          <Snackbar
            open={this.state.snackbarOpen}
            message="Error! Schema name already exists."
            autoHideDuration={5000}
            />
        </Dialog>
      </div>
    );
  }
}
