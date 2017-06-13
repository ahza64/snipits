// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import Checkbox from 'material-ui/Checkbox';
import _ from 'underscore';

export default class CreateFieldDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      required: false,
      type: '',
      editable: false,
      visible: false
    };

    this.handleTypeChanged = this.handleTypeChanged.bind(this);
    this.validName = this.validName.bind(this);
    this.validate = this.validate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChanged = this.handleNameChanged.bind(this);
  }

  uniqueName() {
    const existingFields = _.pluck(this.props.schema, 'name');
    return !_.contains(existingFields, this.state.name);
  }

  validate() {
    if (this.validName() && this.state.type && this.uniqueName()) {
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
      createdAt: Date.now(),
      editable: this.state.editable,
      visible: this.state.visible
    };

    this.props.onClose(newField);
    this.setState({
      name: '',
      type: '',
      required: false,
    });
  }

  handleTypeChanged(event, index, type) {
    this.setState({ type: type });
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
        onClick={ () => this.props.onClose(false) }
      />,
    ];
    const dataTypes = [
      'Integer',
      'Float',
      'Boolean',
      'String',
      'Date',
      'JSON',
      'Array',
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
        <Checkbox
          label="Visible Field?"
          defaultChecked={ false }
          onCheck={ (event, isChecked) => {
            this.setState({ visible: isChecked });
          } }
        />
        <Checkbox
          label="Editable Field?"
          defaultChecked={ false }
          onCheck={ (event, isChecked) => {
            this.setState({ editable: isChecked });
          } }
        />
      </Dialog>
    );
  }
}

CreateFieldDialog.propTypes = {
  open: React.PropTypes.bool.isRequired,
  schema: React.PropTypes.array.isRequired,
  onClose: React.PropTypes.func.isRequired,
};
