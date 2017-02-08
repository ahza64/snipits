// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl } from '../../config';
import DefaultNavbar from '../navbar/defaultNavbar'
import CreateRowDialog from './dialogs/createRowDialog'
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';

// import { generateRows } from './helpers';
var jobTypes = ['a','b','s']
export default class QowSchema extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      fields: [],
      schema: {},
      showCreateRowDialog: false
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    // this.fetchSchemas = this.fetchSchemas.bind(this);
    this.setSchemaFields = this.setSchemaFields.bind(this);
    this.getSchemaFields = this.getSchemaFields.bind(this);
    this.renderDialogs = this.renderDialogs.bind(this);

    this.getSchemaFields(res => {
      this.setSchemaFields(res)
    })
  }

  componentWillMount(){
    console.log();
  }

  setSchemaFields(fields){
    this.setState({fields : fields})
  }

  getSchemaFields(callback){
    let url = schemaUrl.replace(':schemaId', schemaRedux.getState())
    console.log('url',url);
    request
    .get(url)
    .withCredentials()
    .end((err,res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res.body);
      }
    })
  }

  renderDialogs(){
    return(
      <CreateFieldDialog open={ this.state.showCreateRowDialog }></CreateFieldDialog>
    )
  }

  render() {
    return (
        <div>
          <Row> <DefaultNavbar /> </Row>
          <Row>
            <Col xs={0} sm={0} md={1} lg={1} ></Col>
            <Col xs={0} sm={0} md={2} lg={2} >
            </Col>
            <Col xs={8} sm={8} md={8} lg={8} >
              <Row>
            <Table selectable={ false }>
              <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                <TableRow>
                  <TableHeaderColumn>id</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Type</TableHeaderColumn>
                  <TableHeaderColumn className='header-pos'>Version</TableHeaderColumn>
                  <TableHeaderColumn>Created On</TableHeaderColumn>
                  <TableHeaderColumn className='header-pos'>Updated On</TableHeaderColumn>
                  <TableHeaderColumn> Btn </TableHeaderColumn>
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
                        <TableRowColumn>{ field.version }</TableRowColumn>
                        <TableRowColumn>{ field.createdAt }</TableRowColumn>
                        <TableRowColumn>{ field.updatedAt }</TableRowColumn>
                        <TableRowColumn>
                          <FlatButton
                            label="Edit/View"
                            labelPosition="before"
                            secondary={true}
                            onClick={ (event) => {} }
                            icon={ <MoreVertIcon /> }
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
