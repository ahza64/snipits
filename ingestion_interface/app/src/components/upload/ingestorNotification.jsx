// Modules
import React from 'react';

// Components
import UploadLib from './uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class IngestorNotification extends UploadLib {
  constructor() {
    super();

    this.state = {
      selectedIngestor: '',
      ingestors: []
    };

    this.handleChangeIngestor = this.handleChangeIngestor.bind(this);
    this.handleSubmitIngestor = this.handleSubmitIngestor.bind(this);
  }

  componentWillMount() {
    this.setState({ ingestors: this.props.ingestors });
  }

  handleChangeIngestor(event, idx, value) {
    this.setState({ selectedIngestor: value });
  }

  handleSubmitIngestor() {
    var fileName = this.props.files;
    var ingestEmail = this.state.selectedIngestor;
    this.setIngestorEmail(fileName, ingestEmail, () => {
      this.getUploadedFiles(this.props.setFiles);
      this.props.setClose();
    });
  }

  render() {
    const actions = [
      <FlatButton
        label='Submit'
        primary={ true }
        onClick={ this.handleSubmitIngestor }
      />,
      <FlatButton
        label='Cancel'
        primary={ false }
        onClick={ this.props.setClose }
      />,
    ];

    var menuItems = this.state.ingestors.map((ingestor, idx) => {
      return (
        <MenuItem key={ idx } value={ ingestor.email } primaryText={ ingestor.name } />
      );
    });

    return (
      <Dialog
        title='Select your ingestors'
        actions={ actions }
        modal={ true }
        open={ this.props.showModal }
      >
        <SelectField
          floatingLabelText='Ingestors'
          onChange={ this.handleChangeIngestor }
          value={ this.state.selectedIngestor }
        >
          { menuItems }
        </SelectField>
      </Dialog>
    );
  }  
}