import React from 'react';
import _ from 'underscore';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import request from '../../../services/request'
import { schemaListUrl } from '../../../config';

export default class CreateSchema extends React.Component {
  constructor() {
    super();
    this.state = {
      token: '',
      snackbarOpen: false,
      createDisable: true,
      dialogOpen: false,
    };

    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validName = this.validName.bind(this);
  }

  handleNameInput(event, value) {
    this.setState({
      token: value,
      snackbarOpen: false,
    });
  }

  validName() {
    return this.state.token.match(/^[\w\.]+$/g);
  }

  handleSubmit() {
    let error = false;
    const schemaNames = _.pluck(this.props.schemas, 'name');

    if (_.contains(schemaNames, this.state.token)) {
      error = true;
      this.setState({ snackbarOpen: true });
    }

    if (!error) {
      this.addSchema(this.state.token);
      this.setState({ snackbarOpen: false });
      this.props.onClose(false);
    }
  }

  addSchema(name) {
    const newSchema = {
      name: name,
    };
    const url = schemaListUrl.replace(':projectId', this.props.currentProject);
    request
    .post(url)
    .send(newSchema)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error('this err', err);
      } else {
        const self = this;
        this.props.updateSchemas(true, () => {
          self.props.setSchemaId(res.body.id, (val) => {
            self.props.handleSchemaChange(val);
          });
        });
      }
    });
  }

  render() {
    const actions = [
      <RaisedButton
        label="Create Schema"
        primary
        disabled={ !this.validName() }
        onClick={ this.handleSubmit }
      />,
      <FlatButton
        label="Cancel"
        secondary
        onClick={ () => { this.props.onClose(false); } }
      />,
    ];

    return (
      <div>
        <Dialog
          title="Create New Schema"
          open={ this.props.open }
          actions={ actions }
          onClose={ this.props.onClose }
        >
          <TextField
            hintText="Schema Name"
            onChange={ this.handleNameInput }
          />
          <Snackbar
            open={ this.state.snackbarOpen }
            message="Error: Schema name already exists."
            autoHideDuration={ 5000 }
          />
        </Dialog>
      </div>
    );
  }
}
