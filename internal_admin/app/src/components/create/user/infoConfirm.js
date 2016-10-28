// Modules
import React from 'react';

// Components
import userCreateRedux from '../../../reduxes/userCreation';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
const confirmContainerStyle = {
  'borderRadius': 2,
  'height': 500,
  'width': 800,
  'marginTop': 20,
  'textAlign': 'center',
  'display': 'inline-block',
  'padding': 25
};

export default class InfoConfirm extends React.Component {
  constructor() {
    super();   
  }

  componentWillMount() {
    var user = userCreateRedux.getState();
    this.setState({ user: user });
  }

  render() {
    return (
      <div>
        <Paper style={ confirmContainerStyle } zDepth={2} rounded={ false }>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.firstname } floatingLabelText='First Name' disabled={ true } />
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.lastname } floatingLabelText='Last Name' disabled={ true } />
            </Col>
          </Row>

          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.email } floatingLabelText='Email' disabled={ true } />
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.password } floatingLabelText='Password' disabled={ true } />
            </Col>
          </Row>

          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.company } floatingLabelText='Company' disabled={ true } />
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <TextField defaultValue={ this.state.user.role } floatingLabelText=' Role' disabled={ true } />
            </Col>
          </Row>
        </Paper>
      </div>
    );
  }
}