// Modules
import React from 'react';

// Components
import DefaultNavbar from '../navbar/DefaultNavbar';
import UploadZone from '../upload/uploadZone';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class Main extends React.Component {
  constructor() {
    super();    
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row><UploadZone /></Row>
      </div>
    );
  }
}