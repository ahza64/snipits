// Modules
import React from 'react';
import * as request from 'superagent';
import { fileHistoryUrl, deleteFileUrl } from '../../../config';

// Components
import authRedux from '../../../reduxes/auth';
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
      watchers: [],
      ingestions: {}
    };

    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.getWatchers = this.getWatchers.bind(this);
    this.getIngestion = this.getIngestion.bind(this);
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

  getWatchers() {
    this.getWatcherEmail(this.props.files, (emails) => {
      this.setState({ watchers: emails });
    });
  }

  getIngestion() {
    this.getIngestionRecord(this.props.files, (res) => {
      this.setState({ ingestions: res.body });
    });
  }

  render() {
    return (
      <div>
        <IconMenu
          touchTapCloseDelay={ 0 }
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >
          <MenuItem
            primaryText='Set Description'
            onClick={
              () => {
                this.getIngestion();
                this.open('showDescriptionModal');
              } 
            }
          />
          <MenuItem
            primaryText='Set Watchers'
            onClick={
              () => {
                this.open('showWatcherModal');
                this.getWatchers();
              } 
            }
          />
          <MenuItem 
            primaryText='Delete'
            onClick={
              () => this.deleteUploadedFile(this.props.files, () => {
                this.getUploadedFiles(this.props.setFiles);
                this.props.setDelNotification();
                this.writeHistory(this.props.files, 'delete', () => {
                  this.getHistory((heatmapData, historiesData) => {
                    this.props.setHistories(heatmapData, historiesData);
                  });
                });
              })
            }
          />
        </IconMenu>
        <WatcherNotification
          setFiles={ this.props.setFiles }
          showModal={ this.state.showWatcherModal }
          setClose={ () => this.close('showWatcherModal') }
          files={ this.props.files }
          watchers={ this.state.watchers }
        />
        <DescriptionBox
          setFiles={ this.props.setFiles }
          showModal={ this.state.showDescriptionModal }
          setClose={ () => this.close('showDescriptionModal') }
          files={ this.props.files }
          ingestions={ this.state.ingestions }
        />
      </div>
    );
  }
}