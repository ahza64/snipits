// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import SelectField from 'material-ui/SelectField';
import Checkbox from 'material-ui/Checkbox';

export default class CreateFieldDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      schemaId: null,
      schemaFields: [],
      snackBarOpen: 0,
      createDisabled: true,
      required: false,
      type: '',
    };
    this.handleTypeChanged = this.handleTypeChanged.bind(this);
    this.validName = this.validName.bind(this);
    this.validate = this.validate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChanged = this.handleNameChanged.bind(this);
  }
  componentWillMount() {
    this.setState({
      schemaId: this.props.schemaId,
      schemaFields: this.props.schemaFields,
    });
  }
  validate() {
    if (this.validName() && this.state.type) {
      return true;
    }
    return false;
  }

  validName() {
    return this.state.name.match(/^[\w\.]+$/g);
  }

  handleNameChanged(event) {
    this.setState({
      name: event.target.value
    });
  }

  handleSubmit() {
    const newField = {
      name: this.state.name,
      required: this.state.required,
      type: this.state.type,
      status: true,
      createdAt: Date.now()
    };

    this.props.onClose(newField);
    this.setState({
      name: '',
      type: '',
      required: false,
      schemaId: null,
      schemaFields: []
    });
  }

  handleTypeChanged(event, index, type) {
    this.setState({
      type: type
    });
  }

  render() {
    const actions = [
      <RaisedButton
        label="Create"
        primary
        disabled={ !this.validate() }
        onClick={ this.handleSubmit }
      />,
      <FlatButton
        label="Cancel"
        default
        onClick={ (event) => { this.props.onClose(false); } }
      />,
    ];
    const dataTypes = [
      'Integer',
      'Float',
      'Boolean',
      'String',
      'Date',
      'JSON',
      'GeoCoordinates',
      'JPEG',
    ];
    return (
      <Dialog
        title="Add New Schema Field"
        open={ this.props.open }
        actions={ actions }
      >
        <TextField
          hintText="Enter a Field Name"
          value={ this.state.name }
          floatingLabelText="Field Name"
          onChange={ event => this.handleNameChanged(event) }
        />
        <SelectField
          floatingLabelText="Data Type"
          fullWidth
          hintText="Field Type"
          value={ this.state.type }
          onChange={ (event, index, value) => this.handleTypeChanged(event, index, value) }
        >
          {
            dataTypes.map((type, idx) => (
              <MenuItem
                key={ idx }
                value={ type }
                primaryText={ type }
              />
              ))
            }
        </SelectField>
        <Checkbox
          label="Required Field?"
          defaultChecked={ false }
          onCheck={ (event, isChecked) => {
            this.setState({ required: isChecked });
          } }
        />
        <Snackbar
          open={ false }
          message="Error! Field name already exists."
          autoHideDuration={ 5000 }
        />
      </Dialog>
    );
  }
}
