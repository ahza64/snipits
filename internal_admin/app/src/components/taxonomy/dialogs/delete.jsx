
import React from 'react';
import request from '../../../services/request';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { taxonomiesUrl } from '../../../config';


export default class DeleteTaxonomyDialog extends React.Component {
  // constructor() {
  //   super();
  //   this.state = { taxonomies: [] }
  // }
  //
  // loadProps(props) {
  //   this.setState({
  //     taxId: props.taxId
  //   })
  // }



  handleDelete(event) {
    // var deleteTax;
    var deleteTaxIndex;
    // deleteTax = this.props.taxonomies.filter(p => {
    //   return p.id == this.props.taxId
    // });
    deleteTaxIndex = this.props.taxonomies.findIndex(q => {
      return q.id == this.props.taxId
    });
    console.log("deleteTaxIndex", deleteTaxIndex);
    this.props.taxonomies.splice(deleteTaxIndex, 1);
    this.props.onClose(true);
    // let url = taxonomiesUrl + '/' + this.props.taxId;
    // request
    // .delete(url)
    // .withCredentials()
    // .end(err => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     this.props.onClose(true);
    //   }
    // });
  }

  render() {
    const actions = [
      <RaisedButton
        label="Cancel"
        primary={ true }
        keyboardFocused={ true }
        onTouchTap={ (event) => this.props.onClose(false) }
      />,
      <RaisedButton
        label="Confirm"
        keyboardFocused={ false }
        onTouchTap={ (event) => this.handleDelete(event) }
      />
    ];

    return (
      <Dialog
        title="Delete Taxonomy"
        open={ this.props.open }
        actions={ actions }
        >
        Are you sure you'd like to delete "{ this.props.taxName }" Taxonomy?
      </Dialog>
    )
  }
}
