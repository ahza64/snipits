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
    this.handleUnSetIngested = this.handleUnSetIngested.bind(this);
    this.updateIngestionStatus = this.updateIngestionStatus.bind(this);
  }

  componentWillMount() {
    this.setState({ ingestion: this.props.ingestion });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ingestion: nextProps.ingestion });
  }

  updateIngestionStatus(data) {
    var idx = this.props.idx;
    var ingestionList = this.props.ingestions;

    ingestionList[idx].ingested = data.ingested;
    this.props.resetIngestionList(ingestionList);
    this.createIngestedHistory(this.state.ingestion);
  }

  handleSetIngested() {
    this.setIngested(this.state.ingestion.id, true, this.updateIngestionStatus);
  }

  handleUnSetIngested() {
    this.setIngested(this.state.ingestion.id, false, this.updateIngestionStatus);
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
            primaryText='Set ingestion'
            onClick={ this.handleSetIngested }
          />
          <MenuItem
            primaryText='Unset ingestion'
            onClick={ this.handleUnSetIngested }
          />
        </IconMenu>
      </div>
    );
  }
}
