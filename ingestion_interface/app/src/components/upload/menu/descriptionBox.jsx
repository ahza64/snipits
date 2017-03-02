// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import UploadLib from '../uploadLib';
import { ingestionRecordUrl } from '../../../config';
import authRedux from '../../../reduxes/auth';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class DescriptionBox extends UploadLib {
  constructor() {
    super();

    this.state = {
      description: '',
      fileId: null
    };

    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleDescriptionSubmit = this.handleDescriptionSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      description: nextProps.description,
      fileId: nextProps.fileId
    });
  }

  handleDescriptionChange(event, value) {
    this.setState({ description: value });
  }

  handleDescriptionSubmit() {
    var fileName = this.props.files;
    var description = this.state.description;
    var companyId = authRedux.getState()['company.id'];

    request
    .put(ingestionRecordUrl)
    .withCredentials()
    .send({
      fileId: this.state.fileId,
      description: description
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.props.setClose(description);
      }
    });
  }

  render() {
    const actions = [
      <FlatButton
        label='Submit'
        primary={ true }
        onClick={ this.handleDescriptionSubmit }
      />,
      <FlatButton
        label='Cancel'
        primary={ false }
        onClick={ (event) => this.props.setClose(null) }
      />,
    ];

    return (
      <Dialog
        title='Set your description'
        actions={ actions }
        modal={ true }
        open={ this.props.showModal }
        autoScrollBodyContent={ true }
      >
        <Row>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
          <Col xs={12} sm={12} md={8} lg={8} >
            <TextField
              hintText='Description'
              floatingLabelText='Description Box'
              multiLine={ true }
              rows={1}
              value={ this.state.description || '' }
              onChange={ this.handleDescriptionChange }
            />
          </Col>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
        </Row>
      </Dialog>
    );
  }
}