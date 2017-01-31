import React from 'react';
import _ from 'underscore';


import UploadLib from '../uploadLib';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import SelectConfig from '../dialogs/selectConfigDialog';

import { projectsUrl, configsUrl } from '../../../config';
import request from '../../../services/request';

export default class Filters extends UploadLib {
  constructor() {
    super();

    this.state = {
      projectValue: 0,
      configValue: 0,
      configMenuDisable: true,
      uniqueProjects: [],
      uniqueConfigs: []
    };


    this.handleProjectChange = this.handleProjectChange.bind(this);
    this.handleConfigChange = this.handleConfigChange.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.getConfigs = this.getConfigs.bind(this);

  }

    componentWillMount(){
      this.getProjects(this.props.companyId);
    }

    getProjects(companyId) {
      if (companyId) {
        let url = projectsUrl.replace(':companyId', companyId);
        return request
        .get(url)
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err);
          } else {
            this.setState({
              uniqueProjects: res.body
            });
          }
        });
      }
    }

    getConfigs(projectId) {
      if (projectId) {
        let url = configsUrl.replace(':projectId', projectId);
        return request
        .get(url)
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err);
          } else {
            this.setState({
              uniqueConfigs: res.body
            });
          }
        });
      }
    }

    handleProjectChange(event, index, value){

      this.setState({projectValue : value}, ()=>{
        this.props.setProjectId(value);
        if(value != 0){
          this.setState({configMenuDisable : false});
          this.setState({configValue : 0});
        }
        else{
          this.setState({configValue : 0});
          this.setState({configMenuDisable : true});
        }
        var token = this.props.token;
        var setFiles = this.props.setFiles;
        var setSearchTotal = this.props.setSearchTotal;

        if (this.state.projectValue != 0){
          this.getSearchResults(token, (body) => {
            setFiles(body.ingestions);
            setSearchTotal(body.total);

            this.getConfigs(this.state.projectValue);

          }, 0, this.state.projectValue);
        }
        else{
          this.getSearchResults(token, (body) => {
            setFiles(body.ingestions);
            setSearchTotal(body.total);
          }, 0);
        }
      });

    }

    handleConfigChange(event, index, value){
      this.setState({configValue: value}, ()=>{
        this.props.setConfigId(value);
        var token = this.props.token;
        var setFiles = this.props.setFiles;
        var setSearchTotal = this.props.setSearchTotal;

        if (this.state.configValue != 0){
          this.getSearchResults(token, (body) => {
            setFiles(body.ingestions);
            setSearchTotal(body.total);

          }, 0, this.state.projectValue, this.state.configValue);
        }
        else{
          this.getSearchResults(token, (body) => {
            setFiles(body.ingestions);
            setSearchTotal(body.total);

          }, 0, this.state.projectValue);
        }

      });
    }

    render() {
      return (
        <div>
            <DropDownMenu value={this.state.projectValue} onChange={this.handleProjectChange}>
              <MenuItem value={0} primaryText="Choose Project" />
              {
                this.state.uniqueProjects.map((project, idx) => {
                  return (<MenuItem key={ idx } value={ project.id } primaryText = {project.name}/>)
                })
              }
            </DropDownMenu>
            <DropDownMenu value={this.state.configValue} onChange={this.handleConfigChange} disabled={this.state.configMenuDisable}>
              <MenuItem value={0} primaryText="Choose Config" />
              {
                this.state.uniqueConfigs.map((config, idx) => {
                  return (<MenuItem key={ idx } value={ config.id } primaryText = { config.fileType } />)
                })
              }
            </DropDownMenu>
      </div>
    );
    }
  }
