// Modules
import React from 'react';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import UploadZone from '../upload/uploadZone';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
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