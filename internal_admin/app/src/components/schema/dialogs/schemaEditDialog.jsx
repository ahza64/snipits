// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import _ from 'underscore';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import SaveIcon from 'material-ui/svg-icons/content/save';
import AddCircleIcon from 'material-ui/svg-icons/content/add-circle';
import CancelIcon from 'material-ui/svg-icons/content/block';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import request from '../../../services/request';
import { schemaUrl, base } from '../../../config';
import CreateFieldDialog from './createFieldDialog';

export default class SchemaEditDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schema: [],
      schemaId: null,
      createFieldDialogOpen: false
    };

    this.openAddFieldDialog = this.openAddFieldDialog.bind(this);
    this.closeAddFieldDialog = this.closeAddFieldDialog.bind(this);
  }

  componentWillMount() {
    this.setState({
      schema: this.props.schema,
      schemaId: this.props.schemaId,
    });
  }

  handleDeleteField(field) {
    const remainingFields = _.filter(this.state.schema, (thing) => {
      return field.id !== thing.id;
    });
    console.log("remaining Fields", remainingFields);
    this.setState({
      schema: remainingFields
    });
  }

  handleSave() {
    request
    .put(`${base}/schema/`)
    .withCredentials()
    .send({
      id: this.state.schemaId,
      fields: this.state.schema
    })
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(true, res.body);
      }
    });
  }

  closeAddFieldDialog(field) {
    if (field) {
      this.state.schema.push(field);
    }
    this.setState({
      createFieldDialogOpen: false,
    });
  }

  openAddFieldDialog() {
    console.log(event);
    this.setState({
      createFieldDialogOpen: true
    });
  }

  deleteSchema() {
    const url = schemaUrl.replace(":schemaId", this.state.schemaId);
    request
    .delete(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log("deleted");
      }
      this.props.onClose(true, { id: null });
    });
  }

  renderCreateFieldDialog() {
    return (
      <CreateFieldDialog
        onClose={ (field) => { this.closeAddFieldDialog(field); } }
        open={ this.state.createFieldDialogOpen }
      />
    );
  }

  render() {
    const actions = [
      <RaisedButton
        label="Save"
        icon={ <SaveIcon /> }
        primary
        onTouchTap={ () => this.handleSave() }
      />,
      <FlatButton
        label="Cancel"
        icon={ <CancelIcon /> }
        secondary
        onTouchTap={ () => this.props.onClose(false) }
      />,
      <FlatButton
        label="Add Field"
        icon={ <AddCircleIcon /> }
        default
        onTouchTap={ event => this.openAddFieldDialog(event) }
      />,
      <FlatButton
        label="Delete Schema"
        icon={ <DeleteForeverIcon /> }
        onTouchTap={ event => this.deleteSchema() }
      />,
    ];

    return (
      <Dialog
        open={ this.props.open }
        fullWidth
        modal
        actions={ actions }
        title="Schema Editor"
      >
        <Table selectable={ false }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn>#</TableHeaderColumn>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Type</TableHeaderColumn>
              <TableHeaderColumn>Required</TableHeaderColumn>
              <TableHeaderColumn>Created On</TableHeaderColumn>
              <TableHeaderColumn>Delete </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={ false }>
            {
              this.state.schema
              .sort((a, b) => { return a.name > b.name; })
              .map((field, idx) => {
                return (
                  <TableRow key={ idx }>
                    <TableRowColumn> { idx + 1 } </TableRowColumn>
                    <TableRowColumn> { field.name }</TableRowColumn>
                    <TableRowColumn> { field.type }</TableRowColumn>
                    <TableRowColumn> { field.required ? "TRUE" : "FALSE" }</TableRowColumn>
                    <TableRowColumn> { field.createdAt } </TableRowColumn>
                    <TableRowColumn>
                      <RaisedButton
                        onTouchTap={ event => this.handleDeleteField(field) }
                        label="delete"
                        labelPosition="after"
                        icon={ <DeleteIcon /> }
                      />
                    </TableRowColumn>
                  </TableRow>
                );
              })
              }
          </TableBody>
        </Table>
        {this.renderCreateFieldDialog()}
      </Dialog>
    );
  }
}

SchemaEditDialog.propTypes = {
  onClose: React.PropTypes.func.isRequired,
  open: React.PropTypes.bool.isRequired,
  schema: React.PropTypes.array.isRequired,
  schemaId: React.PropTypes.number.isRequired,
};
