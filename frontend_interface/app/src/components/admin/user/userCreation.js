// Modules
import React from 'react';

// Components
import userCreateRedux from '../../../reduxes/userCreation';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
const userCreationContainerStyle = {
  'borderRadius': 2,
  'height': 500,
  'width': 800,
  'marginTop': 20,
  'textAlign': 'center',
  'display': 'inline-block',
  'padding': 25
};

// Dropdown
const dropdown = [
  {
    text: 'Dispatchr Admin',
    role: 'DA'
  },
  {
    text: 'Dispatchr Ingestor',
    role: 'DI'
  },
  {
    text: 'Customer User',
    role: 'CU'
  },
];

export default class UserCreation extends React.Component {
  constructor() {
    super();
    this.handleFirstChange = this.handleFirstChange.bind(this);
    this.handleLastChange = this.handleLastChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.state = { 
      value: 0,
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      company: '',
      role: ''
    };
  }

  componentWillMount() {
    var company = userCreateRedux.getState().company;
    this.setState({ company: company });
  }

  handleFirstChange(event, value) {
    this.setState({ firstname: value });
  }

  handleLastChange(event, value) {
    this.setState({ lastname: value });
  }

  handleEmailChange(event, value) {
    this.setState({ email: value });
  }

  handlePasswordChange(event, value) {
    this.setState({ password: value });
  }

  handleRoleChange(event, idx, value) {
    this.setState({ value: value });
    var role = dropdown[value].role;
    this.setState({ role: role });
  }

  componentWillUnmount() {
    var action = {
      type: 'ADDUSER',
      user: this.state
    };
    userCreateRedux.dispatch(action);
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={1} sm={1} md={1} lg={1}></Col>
          <Col xs={10} sm={10} md={10} lg={10}>
            <Paper style={ userCreationContainerStyle } zDepth={2} rounded={ false }>
              <Row>
                <Col xs={6} sm={6} md={6} lg={6}>
                  <TextField value={this.state.firstname} onChange={this.handleFirstChange} hintText='First Name' floatingLabelText='First Name' />
                </Col>

                <Col xs={6} sm={6} md={6} lg={6}>
                  <TextField value={this.state.lastname} onChange={this.handleLastChange} hintText='Last Name' floatingLabelText='Last Name' />
                </Col>
              </Row>

              <Row>
                <Col xs={6} sm={6} md={6} lg={6}>
                  <TextField value={this.state.email} onChange={this.handleEmailChange} hintText='Email' floatingLabelText='Email' />
                </Col>

                <Col xs={6} sm={6} md={6} lg={6}>
                  <TextField value={this.state.password} onChange={this.handlePasswordChange} hintText='Password' floatingLabelText='Password' type='password' />
                </Col>
              </Row>

              <Row>
                <Col xs={6} sm={6} md={6} lg={6}>
                  <TextField defaultValue={ this.state.company } floatingLabelText='Company' disabled={ true } />
                </Col>
                
                <Col xs={6} sm={6} md={6} lg={6}>
                  <DropDownMenu value={this.state.value} onChange={this.handleRoleChange}>
                  {
                    dropdown.map((ele, idx) => {
                      return (<MenuItem key={ idx } value={ idx } primaryText={ ele.text } />);
                    })
                  }
                  </DropDownMenu>
                </Col>
              </Row>
            </Paper>
          </Col>
          <Col xs={1} sm={1} md={1} lg={1}></Col>
        </Row>
      </div>
    );
  }
}