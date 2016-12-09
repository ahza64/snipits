// Modules
import React, {Component, PropTypes} from 'react';

// Components
import userCreateRedux from '../../../reduxes/userCreation';

// Styles
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

let SelectableList = new MakeSelectable(List);

export default class CompanyList extends React.Component {
  constructor() {
    super();
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.getCompany = this.getCompany.bind(this);
    this.state = {
      companies: [],
      selectedIndex: -1
    };
  }

  handleRequestChange(event, idx) {
    this.setState({ selectedIndex: idx });
  }

  getCompany() {
    var idx = this.state.selectedIndex;
    var selectedCompany = this.state.companies[idx].name;
    var action = {
      type: 'ADDCOMPANY',
      user: {
        company: selectedCompany
      }
    };
    userCreateRedux.dispatch(action);
  }

  componentWillMount() {
    this.setState({ companies: this.props.data });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ companies: nextProps.data });
  }

  render() {
    return (
      <SelectableList value={ this.state.selectedIndex } onChange={ this.handleRequestChange }>
        <Subheader>Select the company</Subheader>
        { 
          this.state.companies.map((com, idx) => {
            return (<ListItem key={ idx } value={ idx } primaryText={ com.name } onClick={ this.getCompany } />);
          })
        }
      </SelectableList>
    );
  }
}
