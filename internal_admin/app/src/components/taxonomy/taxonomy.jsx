
import React from 'react';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl, schemaFieldUrl } from '../../config';
import DefaultNavbar from '../navbar/defaultNavbar'
// import CreateFieldDialog from './dialogs/CreateFieldDialog'
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


export default class Taxonomy extends React.Component {
  render() {
    return (
      <div>
        <Row>
          <DefaultNavbar />
        </Row>
        <div>
          Hello taxo
        </div>
      </div>
    );
  }
}
