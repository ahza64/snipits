// Modules
import React from 'react';
import * as request from 'superagent';
import { s3authUrl } from '../../config';

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
    this.handleDownloadFile = this.handleDownloadFile.bind(this);
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

  handleDownloadFile() {

    request
    .post(s3authUrl)
    .send({
      name: this.state.ingestion.s3FileName,
      type: 'image/png',
      companyId: this.state.ingestion.companyId,
      action: 'getObject'
    })
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        window.open(res.text);
      }
    });

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
            disabled={ this.state.ingestion.ingested }
            primaryText='Set ingestion'
            onClick={ this.handleSetIngested }
          />
          <MenuItem
            primaryText='Unset ingestion'
            disabled={ !this.state.ingestion.ingested }
            onClick={ this.handleUnSetIngested }
          />
          <MenuItem
            primaryText='Dowload File'
            onClick={ this.handleDownloadFile }
          />
        </IconMenu>
      </div>
    );
  }
}
