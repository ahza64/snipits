
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { taxFieldsUrl } from '../../../config';


export default class DeleteTaxValueDialog extends React.Component {

  handleDelete(event) {
    request
    .delete(taxFieldsUrl + '/' + this.props.taxValId)
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
          primary={ true }
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
        Delete this Taxonomy Value?
      </Dialog>
    )
  }
}
