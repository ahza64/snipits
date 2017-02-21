import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import request from '../../../services/request';

import { configUrl, schemaListUrl } from '../../../config';

export default class CreateSchema extends React.Component {
  constructor(){
    super();
    this.state = {
      token: "",
      snackbarOpen: false,
      createDisable: true,
      dialogOpen: false
    };

    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addSchema = this.addSchema.bind(this);
    this.validName = this.validName.bind(this);
  }

  handleNameInput(event, value){
    this.setState({
      token: value,
      snackbarOpen: false
    });
  }

  validName(){
    return this.state.token.match(/^[\w\.]+$/g);
  }

  handleSubmit(){
    var error = false;
    for (var i = 0; i < this.props.schemas.length; i++) {
      if (this.state.token == this.props.schemas[i].name){
        error = true;
        this.setState({snackbarOpen: true});
        break;
      }
    }

    if (!error) {
      this.addSchema(this.state.token);
      this.props.onClose();
    }
  }

  addSchema(name){
    var newSchema = {
      name: name
    };
    let url = schemaListUrl.replace(':projectId', this.props.currentProject);
    request
    .post(url)
    .send(newSchema)
    .withCredentials()
    .end((err, res) => {
      if(err) {
        console.error("this err", err);
      } else {
        this.props.updateSchemas()
        
      }
    })
  }

  render() {

    const actions = [
      <RaisedButton
        label="Create Schema"
        primary={true}
        disabled={!this.validName()}
        onClick={this.handleSubmit}
        />,
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.props.onClose}
        />
    ];

    return (
      <div>
        <Dialog
          title="Create New Schema"
          open={ this.props.open }
          actions={actions}
          onClose={ this.props.onClose}
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
