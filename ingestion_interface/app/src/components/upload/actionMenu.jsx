// Modules
import React from 'react';
import * as request from 'superagent';
import { fileHistoryUrl, deleteFileUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import UploadLib from './uploadLib';
import WatcherNotification from './watcherNotification';

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
      showWatcherModal: false
    };

    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
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
            primaryText='Delete'
            onClick={
              () => this.deleteUploadedFile(this.props.files, this.props.setFiles, this.props.setDelNotification)
            }
          />
          <MenuItem
            primaryText='Set Watchers'
            onClick={ () => this.open('showWatcherModal') }
          />
        </IconMenu>
        <WatcherNotification
          setFiles={ this.props.setFiles }
          showModal={ this.state.showWatcherModal }
          setClose={ () => this.close('showWatcherModal') }
          files={ this.props.files }
        />
      </div>
    );
  }
}