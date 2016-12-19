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
      type: 'UPLOAD',
      fileId: null
    };

    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.handleDeleteIngestion = this.handleDeleteIngestion.bind(this);
  }

  componentWillMount() {
    this.setState({
      fileId: this.props.fileId,
      type: this.props.type
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileId: nextProps.fileId,
      type: nextProps.type
    });
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
      </div>
    );
  }
}