// Modules
import React from 'react';
import * as request from 'superagent';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// Components
import CompanyList from './companyList';
// TODO: add scroll bar when overflow
const companyListContainerStyle = {
  'borderRadius': 2,
  'height': 500,
  'width': 400,
  'marginTop': 20,
  'textAlign': 'center',
  'display': 'inline-block',
  'padding': 25
};
const createComContainerStyle = {
  'borderRadius': 2,
  'height': 250,
  'width': 400,
  'marginTop': 20,
  'textAlign': 'center',
  'display': 'inline-block',
  'padding': 25
};

export default class CompanyCreation extends React.Component {
  constructor() {
    super();
    this.loadCompanyList = this.loadCompanyList.bind(this);
    this.createCompany = this.createCompany.bind(this);
    this.handleCompanyName = this.handleCompanyName.bind(this);
    this.state = {
      companies: [],
      newCompany: ''
    };
  }

  loadCompanyList() {
    request
    .get('http://localhost:3000/company')
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ companies: res.body });
      }
    });
  }

  createCompany() {
    var newCompany = { company: this.state.newCompany };

    request
    .post('http://localhost:3000/company')
    .send(newCompany)
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.loadCompanyList();
      }
    });
  }

  handleCompanyName(event) {
    this.setState({
      newCompany: event.target.value
    });
  }

  componentDidMount() {
    this.loadCompanyList();
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={6} sm={6} md={6} lg={6}>
            <Paper style={ companyListContainerStyle } zDepth={2} rounded={ false }>
              <CompanyList data={ this.state.companies } />
            </Paper>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6}>
            <h4>If it is a new company we don't have ... </h4>
            <Paper style={ createComContainerStyle } zDepth={2} rounded={ false }>
              <div>
                Username: 
                <TextField value={ this.state.newCompany } onChange={ this.handleCompanyName } hintText='Company Name'/>
              </div>
              <div>
                <RaisedButton onClick={ this.createCompany } primary={ true } label='Create'/>
              </div>
            </Paper>
          </Col>
        </Row>
      </div>
    );
  }
}