// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl, schemaFieldUrl } from '../../config';
import DefaultNavbar from '../navbar/defaultNavbar'
import CreateFieldDialog from './dialogs/CreateFieldDialog'
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AddBoxIcon from 'material-ui/svg-icons/content/add-box';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Checkbox from 'material-ui/Checkbox';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';

export default class QowSchema extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      fields: [],
      schema: {},
      createFieldDialogOpen: false
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.setSchemaFields = this.setSchemaFields.bind(this);
    this.getSchemaFields = this.getSchemaFields.bind(this);
    this.updateSchemaFields = this.updateSchemaFields.bind(this);
    this.renderCreateFieldDialog = this.renderCreateFieldDialog.bind(this);
    this.handleAddRowDialogOpen = this.handleAddRowDialogOpen.bind(this);
    this.handleAddRowDialogClose = this.handleAddRowDialogClose.bind(this);
    this.renderDeleteBtn = this.renderDeleteBtn.bind(this);
    this.deleteField = this.deleteField.bind(this);
    this.updateSchemaFields();
  };

  handleAddRowDialogOpen(event){
    this.setState({
      createFieldDialogOpen : true
    });

    console.log(event);
  }

  handleAddRowDialogClose(saved){
    this.setState({
      createFieldDialogOpen : false
    })

    if(saved){
      this.updateSchemaFields();
    }
  }

  deleteField(event, field){
    console.log('deleteField', field);
    let url = schemaFieldUrl.replace(':schemaFieldId', field.id)
    console.log(url);
    request
    .delete(url)
    .withCredentials()
    .end((err,res) =>{
      if (err) {
        console.error(err);
      } else {
        console.log('res===========>',res);
        console.log("field=================>",field, "this.state.fields.indexOf(field)",this.state.fields.indexOf(field) );
        console.log("this.state.fields==========>", this.state.fields);
        var newFields = this.state.fields.filter(x=> {return x.id !== field.id});
        console.log("newFields",newFields);
        this.setState({
          fields : newFields
        });
      }
    })
  }

  componentWillMount(){
    this.setState({schemaId: schemaRedux.getState()})
    this.updateSchemaFields();
  }

  setSchemaFields(fields){
    this.setState({
      fields : fields
    });
  }

  getSchemaFields(callback){
    let url = schemaUrl.replace(':schemaId', schemaRedux.getState())
    console.log('url',url);
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error('errrr', err);
      } else {
        callback(res.body);
      }
    })
  }

  updateSchemaFields(){
    this.getSchemaFields(res => {
      this.setSchemaFields(res);
    })
  }

  renderCreateFieldDialog(){
    return(
      <CreateFieldDialog
        open={ this.state.createFieldDialogOpen }
        onClose={ (saved) => { this.handleAddRowDialogClose(saved) } }
        />
    );
  }

  renderDeleteBtn(field){
    return;
  }

  render() {
    return (
        <div>
          <Row> <DefaultNavbar /> </Row>
          <Row>
            <Col xs={0} sm={0} md={1} lg={1} ></Col>
            <Col xs={0} sm={0} md={2} lg={2} >
              <RaisedButton
                label="Add Field"
                secondary={true}
                onTouchTap={ (event) => {this.handleAddRowDialogOpen(event)} }
                />
              { this.renderCreateFieldDialog() }
            </Col>
            <Col xs={8} sm={8} md={8} lg={8} >
              <Row>
            <Table selectable={ false }>
              <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                <TableRow>
                  <TableHeaderColumn>#</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Type</TableHeaderColumn>
                  <TableHeaderColumn>Required</TableHeaderColumn>
                  <TableHeaderColumn className='header-pos'>Version</TableHeaderColumn>
                  <TableHeaderColumn>Created On</TableHeaderColumn>
                  <TableHeaderColumn className='header-pos'>Updated On</TableHeaderColumn>
                  <TableHeaderColumn> Delete </TableHeaderColumn>
              </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={ false } selectable={ true }>
                {
                  this.state.fields.map((field, idx) => {
                    return (
                      <TableRow key={ idx }>
                        <TableRowColumn>{ idx + 1 }</TableRowColumn>
                        <TableRowColumn>{ field.name }</TableRowColumn>
                        <TableRowColumn>{ field.type }</TableRowColumn>
                        <TableRowColumn>{ field.required ? "TRUE" : "FALSE" }</TableRowColumn>
                        <TableRowColumn>{ field.version }</TableRowColumn>
                        <TableRowColumn>{ field.createdAt }</TableRowColumn>
                        <TableRowColumn>{ field.updatedAt }</TableRowColumn>
                        <TableRowColumn>
                          <RaisedButton
                                onClick={ (event) => { this.deleteField(event, field) } }
                                label="delete"
                                labelPosition="after"
                                icon={ <DeleteIcon />}
                              />
                        </TableRowColumn>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </Row>
        </Col>
        <Col xs={0} sm={0} md={2} lg={2} ></Col>
        </Row>
        </div>
    );
  }
}
