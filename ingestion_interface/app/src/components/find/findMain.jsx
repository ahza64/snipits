// Modules
import React from 'react';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import SearchBar from './searchbar/searchBar';
import ResultList from './resultlist/resultList';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class FindMain extends React.Component {
  constructor() {
    super();

    this.state = {
      files: [],
      token: ''
    };

    this.setFiles = this.setFiles.bind(this);
    this.setToken = this.setToken.bind(this);
  }

  setFiles(files) {
    this.setState({ files: files });
  }

  setToken(token) {
    this.setState({ token: token }); 
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={2} sm={2} md={2} lg={2} ></Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <SearchBar
                setFiles={ this.setFiles }
                setToken={ this.setToken }
              />
            </Row>
            <Row>
              <ResultList
                files={ this.state.files }
                token={ this.state.token }
                setFiles={ this.setFiles }
              />
            </Row>
          </Col>
          <Col xs={2} sm={2} md={2} lg={2} ></Col>
        </Row>
      </div>
    );    
  }
}