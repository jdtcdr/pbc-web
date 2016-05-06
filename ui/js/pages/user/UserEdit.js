"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, putItem, deleteItem } from '../../actions';
import UserForm from './UserForm';

export default class UserEdit extends Component {

  constructor (props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this.state = { user: {} };
  }

  componentDidMount () {
    getItem('users', this.props.params.id)
      .then(response => this.setState({ user: response }));
  }

  _onUpdate (user) {
    putItem('users', user)
      .then(response => this.context.router.goBack())
      .catch(error => this.setState({ error: error }));
  }

  _onRemove () {
    deleteItem('users', this.props.params.id)
      .then(response => this.context.router.go(-2))
      .catch(error => this.setState({ error: error }));
  }

  render () {
    return (
      <UserForm title="Edit User" submitLabel="Update"
        action={`/api/users/${this.props.params.id}`} user={this.state.user}
        onSubmit={this._onUpdate} onRemove={this._onRemove}
        error={this.state.error} />
    );
  }
};

UserEdit.contextTypes = {
  router: PropTypes.any
};
