"use strict";
import React, { Component, PropTypes } from 'react';
import { postItem } from '../../actions';
import UserForm from './UserForm';

export default class UserAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this.state = { user: { name: '', email: '' } };
  }

  _onAdd (user) {
    postItem('users', user)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  render () {
    return (
      <UserForm title="Add User" submitLabel="Add"
        action={`/api/users`} user={this.state.user}
        onSubmit={this._onAdd}
        error={this.state.error} />
    );
  }
};

UserAdd.contextTypes = {
  router: PropTypes.any
};
