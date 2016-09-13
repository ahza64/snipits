import React from 'react';

export default class Login extends React.Component {
  render() {
    return (
      <div>
        <h2>Login</h2>
        <form>
          <span>Username: </span><input placeholder='username'/>
          <span>Password: </span><input placeholder='password'/>
        </form>
      </div>
    );
  }
}