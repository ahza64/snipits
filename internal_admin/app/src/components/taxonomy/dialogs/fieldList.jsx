
import React from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import ScrollArea from 'react-scrollbar';
import {List, ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentClear from 'material-ui/svg-icons/content/clear';

export default class FieldsList extends React.Component {
  constructor() {
    super();

    this.state ={
      field: ''
    };
  }

  handleFieldChanged(event) {
    var field = event.target.value;
    this.setState({
      field: field
    });
  }

  handleAddField() {
    var field = this.state.field;
    var fieldValues = this.props.fieldValues;
    fieldValues.push(field);
    if (this.props.onChange) {
      this.props.onChange(fieldValues);
    }
    this.setState({
      field: ''
    });
  }

  handleDelete(index) {
    var fieldValues = this.props.fieldValues;
    fieldValues.splice(index, 1);
    if (this.props.onChange) {
      this.props.onChange(fieldValues);
    }
    this.render();
  }

  render() {
    return(
      <div>
        <div>
          <TextField
            style={ { marginRight: '20px' } }
            name="fieldValues"
            hintText="i.e. state:western, eastern"
            value={ this.state.field }
            onChange={ (event) => this.handleFieldChanged(event) }
            />
          <FlatButton
            style={ { verticalAlign: 'top', marginTop:'10px' } }
            label="Add Field Value"
            primary={ true }
            onClick={ (event) => this.handleAddField() }
            />
        </div>
        <ScrollArea
          style={ { maxHeight: '100px' } }
          >
          <List>
            {
              this.props.fieldValues.map((field, index) => {
                return(
                  <ListItem
                    key={ index }
                    primaryText={ field }
                    rightIconButton={
                      <IconButton
                        onClick={ (event) => this.handleDelete(index) }
                        >
                        <ContentClear/>
                      </IconButton>
                    }
                  />
                )
              })
            }
          </List>
        </ScrollArea>
      </div>
    )
  }
}
