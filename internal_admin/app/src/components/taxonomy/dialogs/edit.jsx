
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { taxonomiesUrl } from '../../../config';

export default class EditTaxonomyDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      taxId: null,
      taxFieldName: '',
      taxOrder: '',
      taxNodeType: '',
      taxKeys: ''
    }

    this.handleTaxonomySubmit = this.handleTaxonomySubmit.bind(this);
  }

  // TODO bring in selectedTax props for edit sequence and check, then reset to empty to clear
  // form after submition/cancel

  loadProps(props) {
    this.setState({
      taxFieldName: props.fieldName ? props.fieldName : '',
      taxOrder: props.order ? props.order : '',
      taxNodeType: props.nodeType ? props.nodeType : '',
      taxKeys: props.keys ? props.keys : '',
      taxId: props.taxId
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      this.loadProps(nextProps);
    }
  }

  handleFieldNameChange(event, value) {
    var fieldName = event.target.value;
    this.setState({
      taxFieldName: fieldName
    })
  }

  handleOrderChange(event, value) {
    var order = event.target.value;
    this.setState({
      taxOrder: order
    })
  }

  handleNodeTypeChange(event, value) {
    var nodeType = event.target.value;
    this.setState({
      taxNodeType: nodeType
    })
  }

  handleKeysChange(event, value) {
    var keys = event.target.value;
    this.setState({
      taxKeys: keys
    })
  }

  handleTaxonomySubmit(event) {

    var taxonomy = {
      id: this.state.taxId,
      fieldName: this.state.taxFieldName,
      order: this.state.taxOrder,
      nodeType: this.state.taxNodeType,
      keys: this.state.taxKeys,
      qowSchemaId: this.props.schemaId,
      companyId: this.props.companyId,
      workProjectId: this.props.projectId
    }

    request
    .post(taxonomiesUrl)
    .send(taxonomy)
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true)
      }
    });
  }

  actions() {
    return(
      [
        <RaisedButton
          label="Cancel"
          onTouchTap={ (event) => this.props.onClose(false) }
        />,
        <RaisedButton
          label="Confirm"
          primary={ true }
          keyboardFocused={ false }
          onTouchTap={ (event) => this.handleTaxonomySubmit(event) }
        />
      ]
    )
  }

  render() {
    return (
      <Dialog
        title={ this.props.title }
        actions={ this.actions() }
        open={ this.props.open }
        modal={ true }
        autoScrollBodyContent={ true }
        contentStyle={ { maxWidth: '600px' } }>
        <table style={ { width: '100%'} }>
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
                  onChange={ (event) => this.handleFieldNameChange(event) }
                  />
              </td>
            </tr>
            <tr>
              <td>Order</td>
              <td>
                <TextField
                  name="order"
                  hintText="i.e. state:1, county:2, city:3"
                  value={ this.state.taxOrder }
                  fullWidth={ true }
                  onChange={ (event) => this.handleOrderChange(event) }
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
                  onChange={ (event) => this.handleNodeTypeChange(event) }
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
                  onChange={ (event) => this.handleKeysChange(event) }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}
