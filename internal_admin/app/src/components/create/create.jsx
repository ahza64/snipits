// Modules
import React from 'react';
import { browserHistory } from 'react-router';

// Components
import DefaultNavbar from '../navbar/DefaultNavbar';
import CreationStepper from './stepper';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class Admin extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row><CreationStepper /></Row>
      </div>
    );
  }
}