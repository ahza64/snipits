// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
import { usersUrl, activateUserUrl, deactivateUserUrl, deleteUserUrl } from '../../config';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class Users extends React.Component {
  constructor() {
    super();
    this.state = { users: [] };
  }

  toggleUserStatus(event, active, user) {
    let url;

    if(active) {
      url = activateUserUrl.replace(':id', user.id);
    } else {
      url = deactivateUserUrl.replace(':id', user.id);
    }

    return request
    .put(url)
    .withCredentials()
    .end((err, res) => {
      if(err) {
        console.error(err);
      } else {
        console.log('User is ', active ? 'activated.' : 'deactivated.')
        this.fetchUser();
        this.render();
      }
    })
  }

  deleteUser(user) {
    let url = deleteUserUrl.replace(':id', user.id);

    return request
    .delete(url)
    .withCredentials()
    .end((err, res) => {
      if(err) {
        console.error(err);
      } else {
        console.log('User is deleted.')
      }
    })
  }

  fetchUser() {
    return request
    .get(usersUrl)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ users: res.body });
      }
    });
  }

  renderToggle(user) {
    return <Toggle style={{ marginRight: '50px' }} defaultToggled={ user.status === 'active'} onToggle={(event, activate) => this.toggleUserStatus(event, activate, user) } />;
  }

  renderUserInfo(user) {
    return <p>
      <span> { user.email } </span> -- { user.status } -- { user.company.name } { user.deleted ? ' -- deleted' : '' }
    </p>;
  }

  render() {
    this.fetchUser();
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row><h2>This is list of Users</h2></Row>
        <List style={{ width: '500px' }}>
        {
          this.state.users.map((user, idx) => {
            return (<ListItem key={ idx } value={ idx } primaryText={ user.name }
                    secondaryText={ this.renderUserInfo(user) }
                    rightIconButton={
                      <IconButton style={{ height: 20, width: 20, marginTop: 15, backgroundColor: 'black' }} onClick={ (event) => this.deleteUser(user) } />
                    }
                    rightToggle={ this.renderToggle(user) }
                    />);
          })
        }
        </List>
      </div>
    );
  }
}
