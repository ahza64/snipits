// Modules
import React from 'react';

// Components
import UploadLib from './uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class WatcherNotification extends UploadLib {
  constructor() {
    super();

    this.state = {
      watchers: [],
      newWatcher: ''
    };

    this.handleInputWatcher = this.handleInputWatcher.bind(this);
    this.handleAddWatcher = this.handleAddWatcher.bind(this);
    this.handleSubmitWatcher = this.handleSubmitWatcher.bind(this);
  }

  handleInputWatcher(event) {
    this.setState({
      newWatcher: event.target.value
    });
  }

  handleAddWatcher() {
    var curWatchers = [...this.state.watchers, this.state.newWatcher];
    this.setState({ watchers: curWatchers });
  }

  handleSubmitWatcher() {
    console.log('--> ', this.state.watchers);
  }

  render() {
    const actions = [
      <FlatButton
        label='Submit'
        primary={ true }
        onClick={ this.handleSubmitWatcher }
      />,
      <FlatButton
        label='Cancel'
        primary={ false }
        onClick={ this.props.setClose }
      />,
    ];

    return (
      <Dialog
        title='Add your watchers'
        actions={ actions }
        modal={ true }
        open={ this.props.showModal }
      >
        <Row>
          <Col xs={12} sm={12} md={8} lg={8} >
            <TextField
              hintText='Watcher Email'
              floatingLabelText='Watcher Email'
              value={ this.state.newWatcher }
              onChange={ this.handleInputWatcher }
            />
          </Col>
          <Col xs={12} sm={12} md={4} lg={4} >
            <RaisedButton
              label='Add'
              onClick={ this.handleAddWatcher }
            />
          </Col>
        </Row>
        <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>ID</TableHeaderColumn>
                <TableHeaderColumn>Watcher Email</TableHeaderColumn>
                <TableHeaderColumn>Menu</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false } selectable={ false }>
              { 
                this.state.watchers.map((watcher, idx) => {
                  return (
                    <TableRow key={ idx }>
                      <TableRowColumn>{ idx }</TableRowColumn>
                      <TableRowColumn>{ watcher }</TableRowColumn>
                      <TableRowColumn>
                        <RaisedButton label='Remove' />
                      </TableRowColumn>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </Row>
      </Dialog>
    );
  }  
}