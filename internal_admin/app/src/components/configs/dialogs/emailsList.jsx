// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import ScrollArea from 'react-scrollbar';

import validator from 'validator';

export default class EmailsList extends React.Component {
  constructor() {
    super();

    this.state = {
      email: '',
      emailError: null
    };
  }

  handleDelete(idx) {
    var emails = this.props.emails;
    emails.splice(idx, 1);
    if (this.props.onChange) {
      this.props.onChange(emails);
    }
    this.render();
  }

  handleEmailChanged(event) {
    var email = event.target.value;
    this.setState({
      email: email,
      emailError: null
    });
  }

  isAddButtonDisabled() {
    var email = this.state.email;
    return !((email) && (email.length > 0));
  }

  handleAddEmail() {
    var email = this.state.email.toLowerCase();
    if (validator.isEmail(email)) {
      var emails = this.props.emails;
      if (emails.includes(email)) {
        this.setState({
          emailError: 'This email already added'
        });
      } else {
        emails = emails.concat([email]);
        if (this.props.onChange) {
          this.props.onChange(emails);
        }
        this.setState({
          email: '',
          emailError: null
        });
      }
    } else {
      this.setState({
        emailError: 'Incorrect email address'
      });
    }
  }

  render() {
    return(
      <div>
        <div>
          <TextField
            name="watchers"
            hintText="Enter Email"
            value={ this.state.email }
            style={ { marginRight: '50px' } }
            errorText={ this.state.emailError }
            onChange={ (event) => this.handleEmailChanged(event) } />
          <FlatButton  style={ { verticalAlign: 'top', marginTop: '10px' } }
            label="Add"
            primary={ true }
            disabled={ this.isAddButtonDisabled() }
            onTouchTap={ (event) => this.handleAddEmail() }/>
        </div>
        <ScrollArea
          style={ { maxHeight: '160px' } }
          speed={ 0.8 }
          className="area"
          contentClassName="content" >
          <List>
            {
              this.props.emails.map((email, idx) => {
                return(
                  <ListItem
                    key={ idx }
                    rightIconButton={
                      <IconButton
                        touch={ true }
                        tooltipPosition="bottom-left"
                        onTouchTap={ (event) => this.handleDelete(idx) }>
                        <ContentClear color={ grey400 } hoverColor={ darkBlack } />
                      </IconButton>
                    }
                    primaryText={ email } />
                );
              })
            }
          </List>
        </ScrollArea>
      </div>
    );
  }
}
