// Modules
import React from 'react';
import * as request from 'superagent';
import { fileHistoryUrl, deleteFileUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import UploadLib from './uploadLib';
import IngestorNotification from './ingestorNotification';

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

    this.state = { showModal: false };

    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
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
            primaryText='Notify Ingestors'
            onClick={ this.open }
          />
          <MenuItem primaryText='Set Watchers' />
        </IconMenu>
        <IngestorNotification 
          showModal={ this.state.showModal }
          setClose={ this.close }
          ingestors={ this.props.ingestors }
          files={ this.props.files }
        />
      </div>
    );
  }
}