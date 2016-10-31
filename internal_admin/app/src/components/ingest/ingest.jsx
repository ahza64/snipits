// Modules
import React from 'react';
import { browserHistory } from 'react-router';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import IngestList from './ingestList';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class Ingest extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
          <Col xs={12} sm={12} md={8} lg={8} >
            <Row><IngestList /></Row>
          </Col>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
        </Row>
      </div>
    );
  }
}