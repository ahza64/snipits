// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl } from '../../config';
import DefaultNavbar from '../navbar/defaultNavbar'
import CreateFieldDialog from './dialogs/CreateFieldDialog'
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AddBoxIcon from 'material-ui/svg-icons/content/add-box';
import SaveIcon from 'material-ui/svg-icons/content/save';
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
      schemaId: 0,
      showCreateRowDialog: false
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.setSchemaFields = this.setSchemaFields.bind(this);
    this.getSchemaFields = this.getSchemaFields.bind(this);
    this.updateSchemaFields = this.updateSchemaFields.bind(this);
    this.renderDialogs = this.renderDialogs.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleAddRowDialogOpen = this.handleAddRowDialogOpen.bind(this);
    this.handleAddRowDialogClose = this.handleAddRowDialogClose.bind(this);

    this.updateSchemaFields();
  }

  handleAddRowDialogOpen(event){
    console.log(event);
    this.setState({
      showCreateRowDialog : true
    })
  }

  handleAddRowDialogClose(saved){
    this.setState({
      showCreateRowDialog : false
    })

    if(saved){
      this.updateSchemaFields();
    }
  }

  componentWillMount(){
    this.setState({schemaId: schemaRedux.getState()})
    this.updateSchemaFields();
  }
  componentDidMount(){
    console.log('fields', this.state.fields);
  }

  setSchemaFields(fields){
    this.setState({
      fields : fields
    });
  }

  getSchemaFields(callback){
    console.log("++++++++++++schemaID: ", schemaRedux.getState());
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

  handleSave(event){
      console.log(event);
  }

  updateSchemaFields(){
    this.getSchemaFields(res => {
      this.setSchemaFields(res);
    })
  }

  renderDialogs(){
    return(
      <CreateFieldDialog
        open={ this.state.showCreateRowDialog }
        onClose={ (saved) => { this.handleAddRowDialogClose(saved) } }

        />
    )
  }

  render() {
    return (
        <div>
          { this.renderDialogs() }
          <Row> <DefaultNavbar /> </Row>
          <Row>
            <Col xs={0} sm={0} md={1} lg={1} ></Col>
            <Col xs={0} sm={0} md={2} lg={2} >
              <Row>
                <br></br>
              <RaisedButton
                label="Add Row"
                labelPosition="after"
                primary={ true }
                icon= { <AddBoxIcon />}
                onTouchTap={ (event) => this.handleAddRowDialogOpen(event) }/>
            </Row>
            <br></br>
            <Row>
              <RaisedButton
                label="Save"
                primary={ false }
                icon= { <SaveIcon />}
                onTouchTap={ (event) => this.handleSave(event) }/>
            </Row>
            </Col>
            <Col xs={8} sm={8} md={8} lg={8} >
              <Row>
            <Table selectable={ false }>
              <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                <TableRow>
                  <TableHeaderColumn>id</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Type</TableHeaderColumn>
                  <TableHeaderColumn className='header-pos'>Updated On</TableHeaderColumn>
                  <TableHeaderColumn> Required </TableHeaderColumn>
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
                        <TableRowColumn>{ field.updatedAt }</TableRowColumn>
                        <TableRowColumn><Checkbox/></TableRowColumn>
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
