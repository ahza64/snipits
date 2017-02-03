// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as Table from 'reactabular-table';

import DefaultNavbar from '../navbar/defaultNavbar';
import CreateRowDialog from './dialogs/createRowDialog'
import Row from 'react-bootstrap/lib/Row';

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
      projectNameError: null,
      creating: false,
      fields : [],
      showCreateRowDialog: false
    };

    this.addField = this.addField.bind(this);
    this.renderDialogs = this.renderDialogs.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
  }

  componentWillMount(){
    this.fetchSchemas()
    console.log(this.props);
  }

  fetchSchemas(){

  }

  setSchemas(){}

  addField(field) {
  for (let i = 0; i < quantity; i++) {
    const id = startId + i;
    this.state.fields.push({
      id: id,
      name: 'Item name ' + id,
      type: 'B',
      active: i % 2 === 0 ? 'Y' : 'N',
      datetime: '200' + i + '-12-28T14:57:00'
    });
  }
}

  renderDialogs(){
    return(
      <CreateRowDialog open={ this.state.showCreateRowDialog }></CreateRowDialog>
    )
  }

  render() {
    return (
      <div>
        { this.renderDialogs() }
        <Row><DefaultNavbar /></Row>
        <BootstrapTable data={ this.state.fields } insertRow={ true }  >
          <TableHeaderColumn width='20%' dataField='id' isKey={ true }>Job ID</TableHeaderColumn>
          <TableHeaderColumn width='20%' dataField='name' editable={ { type: 'textarea' } }>Job Name</TableHeaderColumn>
          <TableHeaderColumn width='20%' dataField='type' editable={ { type: 'select', options: { values: jobTypes } } }>Job Type</TableHeaderColumn>
          <TableHeaderColumn width='20%' dataField='active' editable={ { type: 'checkbox', options: { values: 'Y:N' } } }>Active</TableHeaderColumn>
          <TableHeaderColumn width='20%' dataField='datetime' editable={ { type: 'datetime' } }>Date Time</TableHeaderColumn>

        </BootstrapTable>
      </div>
    );
  }
}

// const jobs = [];
// const jobTypes = [ 'A', 'B', 'C', 'D' ];
//
// function addJobs(quantity) {
//   const startId = jobs.length;
//   for (let i = 0; i < quantity; i++) {
//     const id = startId + i;
//     jobs.push({
//       id: id,
//       name: 'Item name ' + id,
//       type: 'B',
//       active: i % 2 === 0 ? 'Y' : 'N'
//     });
//   }
// }
//
// addJobs(5);
//
// export default class DataInsertTypeTable extends React.Component {
//   render() {
//     return (
//       <BootstrapTable data={ jobs } insertRow={ true } >
//           <TableHeaderColumn dataField='id' isKey={ true }>Job ID</TableHeaderColumn>
//           <TableHeaderColumn dataField='name' editable={ { type: 'textarea' } }>Job Name</TableHeaderColumn>
//           <TableHeaderColumn dataField='type' editable={ { type: 'select', options: { values: jobTypes } } }>Job Type</TableHeaderColumn>
//           <TableHeaderColumn dataField='active' editable={ { type: 'checkbox', options: { values: 'Y:N' } } }>Active</TableHeaderColumn>
//       </BootstrapTable>
//     );
//   }
// }

// const products = [];
//
// function addProducts(quantity) {
//   const startId = products.length;
//   for (let i = 0; i < quantity; i++) {
//     const id = startId + i;
//     products.push({
//       id: id,
//       name: 'Item name ' + id,
//       price: 2100 + i
//     });
//   }
// }
//
// addProducts(5);
//
// function onAfterInsertRow(row) {
//   let newRowStr = '';
//
//   for (const prop in row) {
//     newRowStr += prop + ': ' + row[prop] + ' \n';
//   }
//   alert('The new row is:\n ' + newRowStr);
// }
//
// const options = {
//   afterInsertRow: onAfterInsertRow   // A hook for after insert rows
// };
//
// export default class InsertRowTable extends React.Component {
//   render() {
//     return (
//       <BootstrapTable data={ products } insertRow={ true } options={ options }>
//           <TableHeaderColumn dataField='id' isKey={ true }>Product ID</TableHeaderColumn>
//           <TableHeaderColumn dataField='name'>Product Name</TableHeaderColumn>
//           <TableHeaderColumn dataField='price'>Product Price</TableHeaderColumn>
//       </BootstrapTable>
//     );
//   }
// }

// const rows = [
//   {
//     id: 100,
//     name: 'John',
//     tools: {
//       hammer: true
//     },
//     country: 'fi'
//   },
//   {
//     id: 101,
//     name: 'Jack',
//     tools: {
//       hammer: false
//     },
//     country: 'dk'
//   }
// ];
// const countries = {
//   fi: 'Finland',
//   dk: 'Denmark'
// };
//
// const columns = [
//   {
//     property: 'name',
//     header: {
//       label: 'Name',
//       transforms: [
//         label => ({
//           onClick: () => alert(`clicked ${label}`)
//         })
//       ]
//     }
//   },
//   {
//     property: 'tools',
//     header: {
//       label: 'Active',
//       transforms: [
//         label => ({
//           onClick: () => alert(`clicked ${label}`)
//         })
//       ]
//     },
//     cell: {
//       formatters: [
//         tools => tools.hammer ? 'Hammertime' : 'nope'
//       ]
//     }
//   },
//   {
//     property: 'country',
//     header: {
//       label: 'Country',
//       transforms: [
//         label => ({
//           onClick: () => alert(`clicked ${label}`)
//         })
//       ]
//     },
//     cell: {
//       formatters: [
//         country => countries[country]
//       ]
//     }
//   },
// ];
//
// export default class DataInsertTypeTable extends React.Component {
//   render() {
//     return (
//       <Table.Provider
//         className="pure-table pure-table-striped"
//         columns={columns}
//         >
//         <Table.Header />
//
//         <Table.Body rows={rows} rowKey="id" />
//       </Table.Provider>
//     )
//   }
// }




// const schema = {
//   type: 'object',
//   properties: {
//     id: {
//       type: 'string'
//     },
//     name: {
//       type: 'string'
//     },
//     position: {
//       type: 'string'
//     },
//     salary: {
//       type: 'integer'
//     },
//     active: {
//       type: 'boolean'
//     }
//   },
//   required: ['id', 'name', 'position', 'salary', 'active']
// };
//
// class CRUDTable extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       rows: generateRows(20, schema), // initial rows
//       columns: this.getColumns() // initial columns
//     };
//
//     this.onAdd = this.onAdd.bind(this);
//     this.onRemove = this.onRemove.bind(this);
//   }
//   getColumns() {
//     const editable = edit.edit({
//       isEditing: ({ columnIndex, rowData }) => columnIndex === rowData.editing,
//       onActivate: ({ columnIndex, rowData }) => {
//         const index = findIndex(this.state.rows, { id: rowData.id });
//         const rows = cloneDeep(this.state.rows);
//
//         rows[index].editing = columnIndex;
//
//         this.setState({ rows });
//       },
//       onValue: ({ value, rowData, property }) => {
//         const index = findIndex(this.state.rows, { id: rowData.id });
//         const rows = cloneDeep(this.state.rows);
//
//         rows[index][property] = value;
//         rows[index].editing = false;
//
//         this.setState({ rows });
//       }
//     });
//
//     return [
//       {
//         property: 'name',
//         header: {
//           label: 'Name'
//         },
//         cell: {
//           transforms: [editable(edit.input())]
//         }
//       },
//       {
//         property: 'position',
//         header: {
//           label: 'Position'
//         },
//         cell: {
//           transforms: [editable(edit.input())]
//         }
//       },
//       {
//         property: 'salary',
//         header: {
//           label: 'Salary'
//         },
//         cell: {
//           transforms: [editable(edit.input({ props: { type: 'number' } }))]
//         }
//       },
//       {
//         property: 'active',
//         header: {
//           label: 'Active'
//         },
//         cell: {
//           transforms: [editable(edit.boolean())],
//           formatters: [
//             active => active && <span>&#10003;</span>
//           ]
//         }
//       },
//       {
//         props: {
//           style: {
//             width: 50
//           }
//         },
//         cell: {
//           formatters: [
//             (value, { rowData }) => (
//               <span
//                 className="remove"
//                 onClick={() => this.onRemove(rowData.id)} style={{ cursor: 'pointer' }}
//               >
//                 &#10007;
//               </span>
//             )
//           ]
//         }
//       }
//     ];
//   }
//   render() {
//     const { columns, rows } = this.state;
//
//     return (
//       <div>
//         <Table.Provider
//           className="pure-table pure-table-striped"
//           columns={columns}
//         >
//           <Table.Header />
//
//           <tbody>
//             <tr>
//               <td><button type="button" onClick={this.onAdd}>Add new</button></td>
//               <td></td>
//               <td></td>
//               <td></td>
//               <td></td>
//             </tr>
//           </tbody>
//
//           <Table.Body rows={rows} rowKey="id" />
//         </Table.Provider>
//       </div>
//     );
//   }
//   onAdd(e) {
//     e.preventDefault();
//
//     const rows = cloneDeep(this.state.rows);
//
//     rows.unshift({
//       id: uuid.v4(),
//       name: 'John Doe'
//     });
//
//     this.setState({ rows });
//   }
//   onRemove(id) {
//     const rows = cloneDeep(this.state.rows);
//     const idx = findIndex(rows, { id });
//
//     // this could go through flux etc.
//     rows.splice(idx, 1);
//
//     this.setState({ rows });
//   }
// }
//
// <CRUDTable />
