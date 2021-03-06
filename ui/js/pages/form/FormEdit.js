
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, putItem, deleteItem, unloadItem } from '../../actions';
import PageHeader from '../../components/PageHeader';
import ConfirmRemove from '../../components/ConfirmRemove';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import FormContents from './FormContents';
import { setFormError, clearFormError, finalizeForm } from './FormUtils';

class FormEdit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onChange = this._onChange.bind(this);
    const state = {};
    if (props.form) {
      state.form = { ...props.form };
    }
    this.state = state;
  }

  componentDidMount() {
    const { form } = this.props;
    if (!form) {
      this._load(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      dispatch, form, formTemplate, formTemplateNotFound, id,
      linkedForm, linkedFormNotFound, linkedFormTemplate,
    } = nextProps;
    if (id && (id !== this.props.id || this.state.form) && !form) {
      this.setState({ form: undefined });
      this._load(nextProps);
    } else if (form && (!this.state.form || form._id !== this.props.form._id)) {
      this.setState({ form: { ...form }, loadedLinkedTemplate: false });
      if (!formTemplate && form.formTemplateId && !formTemplateNotFound) {
        dispatch(loadItem('form-templates', form.formTemplateId._id));
      }
      if (form.linkedFormId && !linkedForm && linkedFormNotFound) {
        dispatch(loadItem('forms', form.linkedFormId));
      }
    } else if (linkedForm && !linkedFormTemplate &&
      !this.state.loadedLinkedTemplate && linkedForm.formTemplateId &&
      !linkedFormNotFound) {
      this.setState({ loadedLinkedTemplate: true });
      dispatch(loadItem('form-templates', linkedForm.formTemplateId._id));
    }
  }

  // removed since we need to preserve those from FormSection
  componentWillUnmount() {
    const { dispatch, formTemplate, id, inline } = this.props;
    if (!inline) {
      dispatch(unloadItem('forms', id));
      if (formTemplate) {
        dispatch(unloadItem('form-templates', formTemplate._id));
      }
    }
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('forms', id, { full: true }));
  }

  _onUpdate(event) {
    event.preventDefault();
    const { formTemplate, history, linkedForm, onDone } = this.props;
    const { form } = this.state;
    const error = setFormError(formTemplate, form);

    if (error) {
      this.setState({ error });
    } else {
      finalizeForm(formTemplate, form, linkedForm);
      putItem('forms', this.state.form)
        .then(formSaved => (onDone ? onDone(formSaved) : history.goBack()))
        .catch(error2 => this.setState({ error2 }));
    }
  }

  _onCancel() {
    const { history, onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      history.goBack();
    }
  }

  _onRemove(event) {
    const { onDone, history, id } = this.props;
    event.preventDefault();
    deleteItem('forms', id)
      .then(() => (onDone ? onDone() : history.goBack()))
      .catch((error) => {
        console.error('!!!', error);
        this.setState({ error });
      });
  }

  _onChange(form) {
    const { formTemplate } = this.props;
    // clear any error for fields that have changed
    const error = clearFormError(formTemplate, form, this.state.error);
    this.setState({ form, error });
  }

  render() {
    const {
      className, formNotFound, formTemplate, formTemplateNotFound, full, inline,
      linkedForm, linkedFormTemplate, onLinkedForm,
    } = this.props;
    const { form, error } = this.state;
    const classNames = ['form'];
    if (className) {
      classNames.push(className);
    }

    let header;
    if (!inline) {
      const cancelControl = [
        <button key="cancel"
          type="button"
          className="button"
          onClick={this._onCancel}>
          Cancel
        </button>,
      ];
      header = (
        <PageHeader title={(formTemplate || {}).name} actions={cancelControl} />
      );
    }

    let result;
    if (form && (formTemplate || formTemplateNotFound || !form.formTemplateId)) {
      const submitLabel = 'Update';
      // if (formTemplate.payable && form.paymentIds.length === 0) {
      //   submitLabel = 'Pay';
      // }

      let linkedFormControl;
      if (linkedForm && linkedFormTemplate) {
        if (!inline) {
          linkedFormControl = (
            <span className="form__link">
              from <Link to={`/forms/${linkedForm._id}/edit`}>
                {linkedFormTemplate.name}
              </Link>
            </span>
          );
        } else {
          linkedFormControl = (
            <span className="form__link">
              from <a onClick={() => onLinkedForm(linkedForm)}>
                {linkedFormTemplate.name}
              </a>
            </span>
          );
        }
      }

      let formContents;
      if (formTemplate) {
        formContents = (
          <FormContents form={form}
            formTemplate={formTemplate}
            linkedForm={linkedForm}
            linkedFormControl={linkedFormControl}
            full={full}
            onChange={this._onChange}
            error={error} />
        );
      } else {
        formContents = <div className="form-error error">Missing form template</div>;
      }

      result = (
        <form className={classNames.join(' ')}
          action={`/forms/${form._id}`}
          onSubmit={this._onUpdate}
          noValidate={true}>
          {header}
          {formContents}
          <footer className="form__footer">
            <button type="submit" className="button">{submitLabel}</button>
            <ConfirmRemove onConfirm={this._onRemove} />
            <button type="button"
              className="button button--secondary"
              onClick={this._onCancel}>
              Cancel
            </button>
          </footer>
        </form>
      );

      if (!inline) {
        result = <div className="form__container">{result}</div>;
      }
    } else if (formNotFound) {
      result = (
        <div>
          {header}
          <NotFound />
        </div>
      );
    } else {
      result = (
        <div>
          {header}
          <Loading />
        </div>
      );
    }
    return result;
  }
}

FormEdit.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object,
  formNotFound: PropTypes.bool,
  formTemplate: PropTypes.object,
  formTemplateNotFound: PropTypes.bool,
  full: PropTypes.bool,
  history: PropTypes.any,
  id: PropTypes.string,
  inline: PropTypes.bool,
  linkedForm: PropTypes.object,
  linkedFormNotFound: PropTypes.bool,
  linkedFormTemplate: PropTypes.object,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onLinkedForm: PropTypes.func,
};

FormEdit.defaultProps = {
  className: undefined,
  form: undefined,
  formNotFound: undefined,
  formTemplate: undefined,
  formTemplateNotFound: undefined,
  full: true,
  history: undefined,
  id: undefined,
  inline: false,
  linkedForm: undefined,
  linkedFormNotFound: undefined,
  linkedFormTemplate: undefined,
  onCancel: undefined,
  onDone: undefined,
  onLinkedForm: undefined,
};

const select = (state, props) => {
  const id = props.match ? props.match.params.id : props.id;
  const form = props.form || state[id];
  let linkedForm = props.linkedForm;
  let linkedFormNotFound;
  if (!linkedForm && form && (form.linkedForm || form.linkedFormId)) {
    linkedForm = form.linkedForm || state[form.linkedFormId];
    linkedFormNotFound = state.notFound[form.linkedFormId];
  }
  return {
    id,
    form,
    formNotFound: state.notFound[id],
    formTemplate: props.formTemplate ||
      (form ? state[(form.formTemplateId || {})._id] : undefined),
    formTemplateNotFound:
      (form ? state.notFound[(form.formTemplateId || {})._id] : undefined),
    linkedForm,
    linkedFormNotFound,
    linkedFormTemplate: props.linkedFormTemplate ||
      (linkedForm ? state[(linkedForm.formTemplateId || {})._id] : undefined),
    notFound: id ? state.notFound[id] : undefined,
    session: state.session,
  };
};

export default connect(select)(FormEdit);
