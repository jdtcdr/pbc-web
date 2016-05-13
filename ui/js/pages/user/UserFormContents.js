"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class UserFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const user = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    let avatarField;
    if (user.avatar) {
      avatarField = (
        <FormField name="avatar" label="Avatar">
          <div>
            <img className="avatar"
              src={user.avatar.data} />
          </div>
          <input name="avatarRemove" type="checkbox"
            checked={user.avatar || false}
            onChange={() => formState.set('avatar', false)}/>
          <label htmlFor="avatarRemove">Clear</label>
        </FormField>
      );
    } else {
      avatarField = (
        <FormField name="avatar" label="Avatar"
          onDrop={formState.dropFile('avatar')}>
          <input name="avatar" type="file"
            onChange={formState.changeFile('avatar')}/>
        </FormField>
      );
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={user.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField name="email" label="Email">
          <input name="email" value={user.email || ''}
            onChange={formState.change('email')}/>
        </FormField>
        <FormField name="password" label="Password">
          <input name="password" type="password" value={user.password || ''}
            onChange={formState.change('password')}/>
        </FormField>
        {avatarField}
        <FormField name="text" label="Text" help={textHelp}>
          <textarea ref="text" name="text" value={user.text || ''} rows={8}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField>
          <input name="administrator" type="checkbox"
            checked={user.administrator || false}
            onChange={formState.toggle('administrator')}/>
          <label htmlFor="administrator">Administrator</label>
        </FormField>
      </fieldset>
    );
  }
};

UserFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
