import React from 'react';

import UploadLib from '../uploadLib';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default class SearchBar extends UploadLib {
  constructor() {
    super();

    this.state = {
      projectValue: 0,
      configValue: 0,
      configMenuDisable: true
    };

    this.handleProjectChange = this.handleProjectChange.bind(this);
    this.handleConfigChange = this.handleConfigChange.bind(this);
  }

    handleProjectChange(event, index, value){
      this.setState({projectValue : value});
      if(value != 0){
        this.setState({configMenuDisable : false})
      }
      else{
        this.setState({configValue : 0});
        this.setState({configMenuDisable : true});
      }

      var token = this.props.token;
      var setFiles = this.props.setFiles;
      var setSearchTotal = this.props.setSearchTotal;

      this.getSearchResults(token, (body) => {
        setFiles(body.ingestions);
        setSearchTotal(body.total);
      }, 0, 4);

    }

    handleConfigChange(event, index, value){
      this.setState({configValue: value});
    }

    render() {
      console.log("props files", this.props.files);
      console.log("props token: ", this.props.token);
      return (
        <div>
            <DropDownMenu value={this.state.projectValue} onChange={this.handleProjectChange}>
              <MenuItem value={0} primaryText="Choose Project" />
              {
                this.props.files.map((file, idx) => {
                  return (<MenuItem key={ idx } value={ idx+1 } primaryText = { file["ingestion_configuration.projectId"] } />)
                })
              }
            </DropDownMenu>
            <DropDownMenu value={this.state.configValue} onChange={this.handleConfigChange} disabled={this.state.configMenuDisable}>
              <MenuItem value={0} primaryText="Choose Config" />
              {
                this.props.files.map((file, idx) => {
                  return (<MenuItem key={ idx } value={ idx+1 } primaryText = { file.ingestionConfigurationId } />)
                })
              }
            </DropDownMenu>
      </div>
    );
    }
  }
