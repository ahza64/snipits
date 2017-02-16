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
      snackbarOpen: false,
      createDisable: true
    };

    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
    this.setCreateDisable = this.setCreateDisable.bind(this);
    this.addSchema = this.addSchema.bind(this);
  }

  setCreateDisable(value){
    this.setState({createDisable:value});
  }

  toggleDialog(){
    var open = this.state.open;
    this.setState({open : ~open});
  }

  handleNameInput(event, value){
    if(value.length === 0){
      this.setCreateDisable(true);
    } else {
      this.setCreateDisable(false);
    }
    this.setState({
      token: value,
      snackbarOpen: false}
    );
  }

  handleSubmit(){
    var error = false;
    console.log("searching names");
    console.log(this.state.token)
    for (var i = 0; i < this.props.schemas.length; i++){
      if (this.state.token == this.props.schemas[i].name){
        console.log("Error: Schema name already exists");
        error = true;
        this.setState({snackbarOpen: true});
        break;
      }
    }

    if(!error){
      this.addSchema(this.state.token);
      this.toggleDialog();
    }

  }

  addSchema(name){
    var newSchema = {
      name: name
    };
    let url = schemaListUrl.replace(':projectId', this.state.currentProject);
    request
    .put(url)
    .send(newSchema)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error("this err", err);
      } else{
        console.log(res);
      }
    })
  }

  render() {

    const actions = [
      <RaisedButton
        label="Create Schema"
        primary={true}
        disabled={this.state.createDisable}
        onClick={this.handleSubmit}
        />,
      <FlatButton
        label="Exit"
        secondary={true}
        onClick={this.toggleDialog}
        />
    ];

    return (
      <div>
        <RaisedButton
          label="Add Schema"
          secondary={true}
          onClick={this.toggleDialog}
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
            message="Error: Schema name already exists."
            autoHideDuration={5000}
            />
        </Dialog>
      </div>
    );
  }
}
