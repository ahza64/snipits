// Modules
import React from 'react';
import request from '../../../services/request';
import _ from 'underscore';
import pageRedux from '../../../reduxes/page';

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
    this.setState({ token: value }, () => {
      this.props.setToken(value);
      this.handleSearch();
    });
  }

  handleSearch() {
    var token = this.state.token;
    var setFiles = this.props.setFiles;
    var setSearchTotal = this.props.setSearchTotal;
    _.debounce(() => {
      pageRedux.dispatch({ type: 'RESET' });
      this.getSearchResults(token, (body) => {
        setFiles(body.ingestions);
        setSearchTotal(body.total);
      })}, 350
    )();
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
      </div>
    );
  }
}
