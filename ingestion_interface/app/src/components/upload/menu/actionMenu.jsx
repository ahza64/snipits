// Modules
import React from 'react';
import * as request from 'superagent';
import { fileHistoryUrl, deleteFileUrl } from '../../../config';

// Components
import authRedux from '../../../reduxes/auth';
import pageRedux from '../../../reduxes/page';
import UploadLib from '../uploadLib';
import WatcherNotification from './watcherNotification';
import DescriptionBox from './descriptionBox';
import SelectConfigDialog from '../dialogs/selectConfigDialog';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export default class ActionMenu extends UploadLib {
  constructor() {
    super();

    this.state = {
      showWatcherModal: false,
      showDescriptionModal: false,
      showSelectConfigDialog: false,
      type: 'UPLOAD',
      fileId: null,
      fileName: '',
      companyId: null,
      projectId: null,
      configId: null,
      originalConfigId: null
    };

    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.handleDeleteIngestion = this.handleDeleteIngestion.bind(this);
  }

  setStateFromProps(props) {
    this.setState({
      fileId: props.fileId,
      type: props.type,
      fileName: props.fileName,
      companyId: props.companyId,
      projectId: props.projectId,
      configId: props.configId,
      originalConfigId: props.configId
    });
  }

  componentWillMount() {
    this.setStateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setStateFromProps(nextProps);
  }

  close(modalName) {
    var stateObj = {};
    stateObj[modalName] = false;
    this.setState(stateObj);
  }

  open(modalName) {
    var stateObj = {};
    stateObj[modalName] = true;
    this.setState(stateObj);
  }

  handleFileDeleted() {
    if (this.props.onFileDeleted) {
      this.props.onFileDeleted(this.props.fileId);
    }
  }

  handleDeleteIngestion() {
    this.deleteUploadedFile(this.props.fileId, () => this.handleFileDeleted());
  }

  handleDescriptionChanged(newDescription) {
    this.close('showDescriptionModal');
    if(newDescription && this.props.onDescriptionChanged) {
      this.props.onDescriptionChanged(this.props.fileId, newDescription);
    }
  }

  handleSelectConfigDialogClose(projectId, configId, projectName, configName) {
    this.setState({
      showSelectConfigDialog: false
    });
    if (configId && (configId !== this.state.originalConfigId)) {
      this.changeFileConfiguration(this.state.fileId, configId, (newS3FileName) => {
        if (this.props.onConfigurationChanged) {
          this.props.onConfigurationChanged(this.state.fileId, projectId, configId, newS3FileName);
        }
      });
    }
  }

  render() {
    return (
      <div>
        <IconMenu
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >
          <MenuItem
            primaryText='Set Description'
            onClick={ () => this.open('showDescriptionModal') }
          />
          <MenuItem
            primaryText='Set Configuration'
            onClick={ () => this.open('showSelectConfigDialog') }
          />
          <MenuItem
            primaryText='Delete'
            onClick={ this.handleDeleteIngestion }
          />
        </IconMenu>
        <DescriptionBox
          showModal={ this.state.showDescriptionModal }
          setClose={ (newDescription) => this.handleDescriptionChanged(newDescription) }
          fileId={ this.props.fileId }
          description={ this.props.description }
        />
        <SelectConfigDialog open={ this.state.showSelectConfigDialog}
          companyId={ this.state.companyId }
          projectId={ this.state.projectId }
          configId={ this.state.configId }
          fileName={ this.state.fileName }
          onClose={ (projectId, configId, projectName, configName) =>
            this.handleSelectConfigDialogClose(projectId, configId, projectName, configName) }
        />
      </div>
    );
  }
}