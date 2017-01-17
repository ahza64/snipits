// Modules
import React from 'react';
import request from '../../../services/request';

// Components
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { projectsUrl, configsUrl } from '../../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class SelectConfigDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      companyId: null,
      projects: [],
      configs: [],
      projectId: null,
      configId: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextProps.open === true) && (this.props.open === false)) {
      this.setState({
        companyId: nextProps.companyId,
        projectId: nextProps.projectId,
        configId: nextProps.configId,
      });
      this.fetchProjects(nextProps.companyId);
    }
  }

  fetchProjects(companyId) {
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
            projects: res.body
          });
          this.selectProject(res.body);
        }
      });
    }
  }

  selectProject(projects) {
    if (projects.length > 0) {
      var projectId = this.state.projectId;
      var selected = projects.find(project => {
        return project.id === projectId;
      });
      if(selected) {
        this.fetchConfigs(selected.id);
      } else {
        projectId = projects[0].id;
        this.setState({
          projectId: projectId
        });
        this.fetchConfigs(projectId);
      }
    } else {
      this.setState({
        configs: [],
        projectId: null,
        configId: null
      });
    }
  }

  fetchConfigs(projectId) {
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
            configs: res.body
          });
          this.selectConfig(res.body);
        }
      });
    }
  }

  selectConfig(configs) {
    if (configs.length > 0) {
      var configId = this.state.configId;
      var selected = configs.find(config => {
        return config.id === configId;
      });
      if(!selected) {
        configId = configs[0].id;
        this.setState({
          configId: configId
        });
      }
    } else {
      this.setState({
        configId: null,
      });
    }
  }

  handleProjectSelectChanged(event, value) {
    this.setState({
      projectId: value
    });
    this.fetchConfigs(value);
  }

  handleConfigSelectChanged(event, value) {
    this.setState({
      configId: value
    });
  }

  handleSubmit(event) {
    var projectName = null;
    for (var i = 0; i < this.state.projects.length; i++) {
      if (this.state.projects[i].id === this.state.projectId) {
        projectName = this.state.projects[i].name;
      }
    }
    var configName = null;
    for (var i = 0; i < this.state.configs.length; i++) {
      if (this.state.configs[i].id === this.state.configId) {
        configName = this.state.configs[i].fileType;
      }
    }
    this.props.onClose(this.state.projectId, this.state.configId, projectName, configName);
  }

  renderProjectSelectField() {
    return(
      <SelectField
        floatingLabelText="Work Project"
        value={ this.state.projectId }
        onChange={ (event, index, value) => this.handleProjectSelectChanged(event, value) } >
        { this.state.projects.map((project, idx) => {
            return(
              <MenuItem key={ idx } value={ project.id } primaryText={ project.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderConfigSelectField() {
    return(
      <SelectField
        floatingLabelText="Configuration"
        value={ this.state.configId }
        onChange={ (event, index, value) => this.handleConfigSelectChanged(event, value) } >
        { this.state.configs.map((config, idx) => {
            return(
              <MenuItem key={ idx } value={ config.id } primaryText={ config.fileType } />
            );
          })
        }
      </SelectField>
    );
  }

  render() {
    const actions = [
      <FlatButton
        label='Submit'
        primary={ true }
        disabled={ !this.state.configId }
        onClick={ (event) => this.handleSubmit(event) }
      />,
      <FlatButton
        label='Cancel'
        primary={ false }
        onClick={ (event) => this.props.onClose(null, null, null, null) }
      />,
    ];

    return (
        <Dialog
          title="Select Ingestion Configuration"
          actions={ actions }
          modal={ true }
          open={ this.props.open }
          autoScrollBodyContent={ true } >
          <table style={ { width: '100%', marginTop: '20px' } }>
            <tbody>
              <tr>
                <td>For file: { this.props.fileName }</td>
                <td></td>
              </tr>
              <tr>
                <td>{ this.renderProjectSelectField() }</td>
                <td>{ this.renderConfigSelectField() }</td>
              </tr>
            </tbody>
          </table>
        </Dialog>
    );
  }
}
