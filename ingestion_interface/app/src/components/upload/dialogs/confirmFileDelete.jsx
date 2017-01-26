// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SelectField from 'material-ui/SelectField';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class confirmFileDelete extends React.Component {
  constructor() {
    super();

    this.state = {
      companyId: null,
      projects: [],
      configs: [],
      projectId: null,
      configId: null,
    };

    //this.handleDelete = this.handleDelete.bind(this);
  }

  // handleDelete(event) {
  //   console.log(event.target);
  // }
  //
  // close(){
  //   this.props.setState({showDeleteDialog : false})
  // }


  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary={ true }
        onClick= { (event) => this.props.onClose() }
      />,
      <FlatButton
        label='Confirm'
        primary={ false }
        onClick={ (event)  => this.props.onDelete() }
      />,
    ];

    return (
        <Dialog
          title="Are you sure you want to delete this file?"
          actions={ actions }
          modal={true}
          autoScrollBodyContent={ true }
          open={ this.props.open }
          >
          <table style={ { width: '100%', marginTop: '20px' } }>
            <tbody>
              <tr>
                <td>For file: { this.props.fileName }</td>
              </tr>
            </tbody>
          </table>
        </Dialog>
    );
  }
}
