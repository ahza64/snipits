// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import _ from 'underscore';
import FlatButton from 'material-ui/FlatButton';
import request from '../../../services/request';
import { schemaListUrl, schemaUrl, schemaFieldUrl } from '../../../config';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import CreateFieldDialog from './createFieldDialog.jsx';


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

    componentWillMount(){
      this.setState({
        schema: this.props.schema,
        schemaId: this.props.schemaId
      });
    }

    handleDeleteField(field){
      var news = _.filter(this.state.schema, (thing) => {
        return field.id !== thing.id;
      })
      console.log("remaining Fields",news);
      this.setState({
        schema: news
      });
    }

    handleSave(){
      request
      .put('http://localhost:3335/schema/')
      .withCredentials()
      .send({
        id: this.state.schemaId,
        fields: this.state.schema
      })
      .end((err,res) => {
        if (err) {
          console.error(err);
        } else {
          this.props.onClose(true, res.body);
        }
      })
    }

    closeAddFieldDialog(field){
      if (field) {
        this.state.schema.push(field);
      }
      this.setState({
        createFieldDialogOpen: false,
      });
    }

    openAddFieldDialog(){
      console.log(event);
      this.setState({
        createFieldDialogOpen: true
      });
    }

    renderCreateFieldDialog(){
      return(
        <CreateFieldDialog
          onClose={ (field) => this.closeAddFieldDialog(field)}
          open={this.state.createFieldDialogOpen}
        />
      );
    }
    deleteSchema(){
      let url = schemaUrl.replace(":schemaId", this.state.schemaId);
      request
      .delete(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log("deleted");
        }
        this.props.onClose(true, {id:null});
      })
    }
    render() {
      const actions = [
        <RaisedButton
          label="Save"
          primary
          onClick={ (event)=>{ this.handleSave()} }
        />,
        <FlatButton
          label="Cancel"
          secondary
          onClick={ (event) => { this.props.onClose(false); } }
        />,
        <FlatButton
          label="Add Field"
          default
          onClick={ (event) => this.openAddFieldDialog(event) }
        />,
       <FlatButton
        label="Delete Schema"
        icon={ <DeleteIcon /> }
        onTouchTap={ (event)=> this.deleteSchema() }
        />,
      ];

      return (
        <Dialog
          open={this.props.open}
          fullWidth
          modal
          actions={actions}
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
          <TableBody displayRowCheckbox={ false } selectable={ true }>
            {
              this.state.schema
              .sort((a, b) => { return a.id - b.id; })
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
                        onClick={ (event) => {  this.handleDeleteField(field) } }
                        label="delete"
                        labelPosition="after"
                        icon={ <DeleteIcon /> }
                      />
                    </TableRowColumn>
                  </TableRow>
              )})
            }
          </TableBody>
        </Table>
        {this.renderCreateFieldDialog()}
      </Dialog>
      );
    }
  }
