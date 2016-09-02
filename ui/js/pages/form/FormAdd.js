"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, postItem, haveSession, setSession } from '../../actions';
import Loading from '../../components/Loading';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

export default class FormAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      form: {
        fields: [],
        formTemplateId: props.formTemplateId
      }
    };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load (props) {
    getItem('form-templates', props.formTemplateId)
    .then(formTemplate => this.setState({ formTemplate: formTemplate }))
    .catch(error => console.log("!!! FormAdd catch", error));
  }

  _onAdd (event) {
    event.preventDefault();
    const { onDone } = this.props;
    const { formTemplate, form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error: error });
    } else {
      finalizeForm(formTemplate, form);
      postItem('forms', form)
      .then(response => {
        // if we didn't have a session and we created one as part of adding,
        // remember it.
        if (! haveSession() && response.token) {
          console.log('!!! FormAdd set session', response);
          setSession(response);
        }
        return {};
      })
      .then(response => onDone ? onDone() : this.context.router.goBack())
      .catch(error => {
        console.log('!!! FormAdd post error', error);
        this.setState({ error: error });
      })
      .catch(error => console.log('!!! FormAdd post 2', error));
    }
  }

  _onChange (form) {
    const { formTemplate } = this.state;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form: form, error: error });
  }

  render () {
    const { onCancel } = this.props;
    const { form, formTemplate, error } = this.state;
    let classNames = ['form'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    let result;
    if (formTemplate) {

      let cancelControl;
      if (onCancel) {
        cancelControl = (
          <button type="button" className="button button--secondary"
            onClick={onCancel}>
            Cancel
          </button>
        );
      }

      result = (
        <form className={classNames.join(' ')} action={'/forms'}
          onSubmit={this._onAdd}>
          <FormContents form={form} formTemplate={formTemplate}
            onChange={this._onChange} error={error} />
          <footer className="form__footer">
            <button type="submit" className="button">
              {formTemplate.submitLabel || 'Submit'}
            </button>
            {cancelControl}
          </footer>
        </form>
      );

    } else {
      result = <Loading />;
    }
    return result;
  }
};

FormAdd.propTypes = {
  formTemplateId: PropTypes.string.isRequired,
  formTemplate: PropTypes.object,
  onCancel: PropTypes.func,
  onDone: PropTypes.func
};

FormAdd.contextTypes = {
  router: PropTypes.any
};
