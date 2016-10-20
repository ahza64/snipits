// Modules
import React from 'react';
import { browserHistory } from 'react-router';

// Components
import DefaultNavbar from '../navbar/DefaultNavbar';

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
        <Row><h2>This is Ingestion</h2></Row>
      </div>
    );
  }
}