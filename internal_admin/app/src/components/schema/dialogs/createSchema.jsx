import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import { configUrl } from '../../../config';

export default class CreateSchema extends React.Component {
  constructor(){
    super();
    this.state = {
      token: ""
    };

    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount(){
  }


  handleNameInput(event, value){
    var setCreateDisable = this.props.setCreateDisable;
    if(value.length === 0){
      setCreateDisable(true);
    }
    else setCreateDisable(false);
    this.setState({token:value});
  }

  handleSubmit(){
    var addSchema = this.props.addSchema;
    var setDialog = this.props.setDialog;
    addSchema(this.state.token);
    setDialog();
    location.reload();
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

    const styles = {
      hintStyle: {
        color: 0b110000,
        borderColor: 0b110000
      }
    };

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
        </Dialog>
      </div>
    );
  }
}
