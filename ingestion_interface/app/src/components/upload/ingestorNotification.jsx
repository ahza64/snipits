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

    this.state = { ingestors: [] };

    this.setIngestorEmail = this.setIngestorEmail.bind(this);
  }

  componentWillMount() {
    this.setState({ ingestors: this.props.ingestors });
  }

  setIngestorEmail(event, idx, value) {
    console.log('selected ', value);
    
    var fileName = this.props.files;
    this.setIngestorEmail(fileName);
  }

  render() {
    const actions = [
      <FlatButton
        label='Submit'
        primary={ true }
        onClick={ this.props.setClose }
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
          onChange={ this.setIngestorEmail }
        >
          { menuItems }
        </SelectField>
      </Dialog>
    );
  }  
}