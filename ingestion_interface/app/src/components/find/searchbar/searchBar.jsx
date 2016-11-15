// Modules
import React from 'react';
import request from 'superagent';

// Components
import UploadLib from '../../upload/uploadLib';


// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class SearchBar extends UploadLib {
  constructor() {
    super();

    this.state = {
      token: '',
      searching: 0,
    };

    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearchInput(event, value) {
    this.setState({ token: value });
    this.props.setToken(value);
  }

  handleSearch() {
    var token = this.state.token;
    this.getSearchResults(token, this.props.setFiles);
  }

  render() {
    return (
      <div>
        <TextField
          hintText='Search for ingestion files ... '
          fullWidth={true}
          value={ this.state.token }
          onChange={ this.handleSearchInput }
        />
        <RaisedButton
          label='Search'
          fullWidth={true}
          onClick={ this.handleSearch }
        />
      </div>
    );
  }
}