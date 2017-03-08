
import React from 'react';

import Dialog from 'material-ui/Dialog';

export default class EditTaxValueDialog extends React.Component {

  render() {
    return(
      <Dialog
        title={ this.props.title }
        modal={ true }
        open={ this.props.open }
        contentStyle={ { maxWidth: '600px' } }
        autoScrollBodyContent={ true }
        >
        hi
      </Dialog>
    );
  }
}
