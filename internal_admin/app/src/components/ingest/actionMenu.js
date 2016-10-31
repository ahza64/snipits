// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import authRedux from '../../reduxes/auth';
import { ingestionUrl } from '../../config';
import IngestLib from './ingestLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export default class ActionMenu extends IngestLib {
  constructor() {
    super();

    this.state = { ingestion: {} };

    this.handleSetIngested = this.handleSetIngested.bind(this);
    this.updateIngestionStatus = this.updateIngestionStatus.bind(this);
  }

  componentWillMount() {
    this.setState({ ingestion: this.props.ingestion });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ingestion: nextProps.ingestion });
  }

  updateIngestionStatus() {
    var idx = this.props.idx;
    var ingestionList = this.props.ingestions;
    ingestionList[idx].ingested = true;
    this.props.resetIngestionList(ingestionList);
    this.createIngestedHistory(this.state.ingestion.fileName);
  }

  handleSetIngested() {
    this.setIngested(this.state.ingestion.id, this.updateIngestionStatus);
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
            primaryText='Set as ingested'
            onClick={ this.handleSetIngested }
          />
        </IconMenu>
      </div>
    );
  }
}