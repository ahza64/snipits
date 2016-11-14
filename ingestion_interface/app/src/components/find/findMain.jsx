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
      results: [],
    };

    this.setResults = this.setResults.bind(this);
  }

  setResults(results) {
    this.setState({ results: results });
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={2} sm={2} md={2} lg={2} ></Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row><SearchBar setResults={ this.setResults } /></Row>
            <Row><ResultList setResults={ this.setResults } /></Row>
          </Col>
          <Col xs={2} sm={2} md={2} lg={2} ></Col>
        </Row>
      </div>
    );    
  }
}