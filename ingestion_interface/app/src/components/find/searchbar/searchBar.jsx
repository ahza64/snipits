// Modules
import React from 'react';
import request from 'superagent';

// Components
import { fileHistoryUrl, deleteFileUrl, ingestionRecordUrl, watcherUrl } from '../../../config';


// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class SearchBar extends React.Component {
  constructor() {
    super();

    this.state = {
      search: ''
    };

    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearchInput(event, value) {
    this.setState({ search: value });
  }

  handleSearch() {

  }

  render() {
    return (
      <div>
        <TextField
          hintText='Search for ingestion files ... '
          fullWidth={true}
          value={ this.state.search }
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