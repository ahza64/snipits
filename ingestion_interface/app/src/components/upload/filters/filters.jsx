import React from 'react';
import _ from 'underscore';

import UploadLib from '../uploadLib';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default class Filters extends UploadLib {
  constructor() {
    super();

    this.state = {
      projectValue: 0,
      configValue: 0,
      configMenuDisable: true,
      uniqueProjects: [],
      configs: [],
      uniqueConfigs: []
    };

    this.handleProjectChange = this.handleProjectChange.bind(this);
    this.handleConfigChange = this.handleConfigChange.bind(this);
    this.makeProjectListUnique = this.makeProjectListUnique.bind(this);
  }

    componentWillMount(){

      this.getAllFiles((body) =>{
        console.log("ingestions config: ", body[0].ingestion_configuration.projectId)
        this.makeProjectListUnique(body);
      })
    }

    makeProjectListUnique(files){
      var projectIds = [];
      var configs = []
      for (var i = 0; i < files.length-1; i++){
        projectIds[i] = files[i].ingestion_configuration.projectId;
        configs[i] = files[i].ingestionConfigurationId;
      }
      var uniqueProjects = _.uniq(projectIds);

      this.setState({uniqueProjects : uniqueProjects})

    }



    handleProjectChange(event, index, value){

      this.setState({projectValue : value}, ()=>{
          console.log("project value after menu choice: ", this.state.projectValue )
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
          console.log("current projectvalue: ", this.state.projectValue)
          setFiles(body.ingestions);
          setSearchTotal(body.total);

          var files = this.props.files;
          var uniqueConfigs = [];
          console.log("filesss: ", files)

          for (var i = 0; i < files.length; i++){
            uniqueConfigs[i] = files[i].ingestionConfigurationId;
          }

          uniqueConfigs = _.uniq(uniqueConfigs);
          this.setState({uniqueConfigs : uniqueConfigs});

        }, 0, this.state.projectValue);
      });

    }

    handleConfigChange(event, index, value){
      this.setState({configValue: value}, ()=>{
        var token = this.props.token;
        var setFiles = this.props.setFiles;
        var setSearchTotal = this.props.setSearchTotal;

        this.getSearchResults(token, (body) => {
          console.log("current config value: ", this.state.configValue)
          setFiles(body.ingestions);
          setSearchTotal(body.total);

        }, 0, this.state.projectValue, this.state.configValue);


      });
    }

    render() {
      return (
        <div>
            <DropDownMenu value={this.state.projectValue} onChange={this.handleProjectChange}>
              <MenuItem value={0} primaryText="Choose Project" />
              {
                this.state.uniqueProjects.map((projectId, idx) => {
                  return (<MenuItem key={ idx } value={ projectId } primaryText = {projectId}/>)
                })
              }
            </DropDownMenu>
            <DropDownMenu value={this.state.configValue} onChange={this.handleConfigChange} disabled={this.state.configMenuDisable}>
              <MenuItem value={0} primaryText="Choose Config" />
              {
                this.state.uniqueConfigs.map((configId, idx) => {
                  return (<MenuItem key={ idx } value={ configId } primaryText = { configId } />)
                })
              }
            </DropDownMenu>
      </div>
    );
    }
  }
