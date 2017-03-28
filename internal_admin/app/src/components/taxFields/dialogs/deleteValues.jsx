
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { taxFieldsUrl } from '../../../config';


export default class DeleteTaxValuesDialog extends React.Component {

  handleDelete(event) {
    request
    .delete(taxFieldsUrl + '/schema/' + this.props.schemaId)
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.props.onClose(false)
      }
    })
  }

  actions() {
    return(
      [
        <RaisedButton
          label="cancel"
          onClick={ (event) => this.props.onClose(false) }
        />,
        <RaisedButton
          label="Confirm"
          onClick={ (event) => this.handleDelete(event) }
          secondary={ true }
        />
      ]
    )
  }

  render() {
    return (

      <Dialog
        title="Delete Taxonomy Value"
        open={ this.props.open }
        actions={ this.actions() }
      >
        Are you sure you want to delete ALL the taxonomy values for this seleted Project Schema?
      </Dialog>
    )
  }
}
