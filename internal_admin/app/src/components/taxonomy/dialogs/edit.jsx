
import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ValidationDialog from './validation';

export default class EditTaxonomyDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      taxId: null,
      taxFieldName: '',
      taxOrder: '',
      taxNodeType: '',
      taxKeys: '',
      showValidationDialog: false
    };

    this.handleTaxonomySubmit = this.handleTaxonomySubmit.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      this.loadProps(nextProps);
    }
  }

  loadProps(props) {
    this.setState({
      taxFieldName: props.fieldName ? props.fieldName : '',
      taxOrder: props.order ? props.order : '',
      taxNodeType: props.nodeType ? props.nodeType : '',
      taxKeys: props.keys ? props.keys : '',
      taxId: props.taxId
    });
  }

  handleFieldNameChange(event, value) {
    var fieldName = event.target.value;
    this.setState({
      taxFieldName: fieldName
    });
    this.isConfirmButtonDisabled();
  }

  handleOrderChange(event, value) {
    var order = event.target.value;
    this.setState({
      taxOrder: order
    });
  }

  handleNodeTypeChange(event, value) {
    var nodeType = event.target.value;
    this.setState({
      taxNodeType: nodeType
    });
  }

  handleKeysChange(event, value) {
    var keys = event.target.value;
    this.setState({
      taxKeys: keys
    });
  }
  // regex checks for non-alphanumeric and non-underscore values
  isConfirmButtonDisabled() {
    if ((this.state.taxFieldName.length > 0) && this.state.taxFieldName.match(/^[\w]+$/g)){
      return false;
    }
    return true;
  }

  handleTaxonomySubmit(event) {
    let duplicate = this.props.taxonomies.filter(p => {
      return p.fieldName == this.state.taxFieldName
    });
    if (duplicate[0] && (this.props.taxId === undefined)) {
      this.setState({
        showValidationDialog: true
      });
    } else {
      var taxonomy = {
        id: this.state.taxId,
        fieldName: this.state.taxFieldName,
        nodeType: this.state.taxNodeType,
        keys: this.state.taxKeys,
        qowSchemaId: this.props.schemaId,
        companyId: this.props.companyId,
        workProjectId: this.props.projectId
      };
      var updateTax;
      var updateTaxIndex;

      if (!taxonomy.id) {
        this.props.taxonomies.push(taxonomy);
      } else {
        updateTaxIndex = this.props.taxonomies.findIndex(q => {
          return q.id == taxonomy.id
        });
        this.props.taxonomies.splice(updateTaxIndex, 1, taxonomy);
      }
      this.props.onClose(true);
    }
  }

  handleValidationClose() {
    this.setState({
      taxId: null,
      taxFieldName: '',
      taxOrder: '',
      taxNodeType: '',
      taxKeys: '',
      showValidationDialog: false
    });
  }

  renderValidation() {
    return (
      <ValidationDialog
        open={ this.state.showValidationDialog ? this.state.showValidationDialog : false }
        onClose={ () => this.handleValidationClose() }
      />
    );
  }

  actions() {
    return (
      [
        <RaisedButton
          label="Cancel"
          onTouchTap={ (event) => this.props.onClose(false) }
        />,
        <RaisedButton
          label="Confirm"
          primary={ true }
          keyboardFocused={ false }
          disabled={ this.isConfirmButtonDisabled() }
          onTouchTap={ event => this.handleTaxonomySubmit(event) }
        />
      ]
    );
  }

  render() {
    return (
      <Dialog
        title={ this.props.title }
        actions={ this.actions() }
        open={ this.props.open ? this.props.open : false }
        modal={ true }
        autoScrollBodyContent={ true }
        contentStyle={ { maxWidth: '600px' } }>
        { this.renderValidation() }
        <table style={ { width: '100%' } }>
          <tbody>
            <tr>
              <td>Company</td>
              <td>
                <TextField
                  name="companyName"
                  fullWidth={ true }
                  disabled={ true }
                  value={ this.props.companyName }
                />
              </td>
            </tr>
            <tr>
              <td>Work Project</td>
              <td>
                <TextField
                  name="projectName"
                  fullWidth={ true }
                  disabled={ true }
                  value={ this.props.projectName }
                />
              </td>
            </tr>
            <tr>
              <td>Schema Name</td>
              <td>
                <TextField
                  name="schemaName"
                  fullWidth={ true }
                  disabled={ true }
                  value={ this.props.schemaName }
                />
              </td>
            </tr>
            <tr>
              <td>Field Name</td>
              <td>
                <TextField
                  name="fieldName"
                  hintText="i.e. state, county or city"
                  value={ this.state.taxFieldName }
                  fullWidth={ true }
                  onChange={ event => this.handleFieldNameChange(event) }
                />
              </td>
            </tr>
            <tr>
              <td>Node Type</td>
              <td>
                <TextField
                  name="nodeType"
                  hintText="Enter Taxonomy Node Type"
                  value={ this.state.taxNodeType }
                  fullWidth={ true }
                  onChange={ event => this.handleNodeTypeChange(event) }
                />
              </td>
            </tr>
            <tr>
              <td>Keys</td>
              <td>
                <TextField
                  name="keys"
                  hintText="Enter Taxonomy Keys"
                  value={ this.state.taxKeys }
                  fullWidth={ true }
                  onChange={ event => this.handleKeysChange(event) }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}
