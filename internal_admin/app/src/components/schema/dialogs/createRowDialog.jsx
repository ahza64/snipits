// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';

import Row from 'react-bootstrap/lib/Row';

import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';
import uuid from 'uuid';


export default class CreateRowDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      showCreateRowDialog: false
    };
  }

  render(){
    return(
      <div>is open</div>
    )
  }
}
