
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Markdown from 'markdown-to-jsx';
import { getItems, getItem } from '../../actions';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import Button from '../../components/Button';
import AddIcon from '../../icons/Add';
import FormAdd from './FormAdd';
import FormEdit from './FormEdit';
import PaymentPay from '../payment/PaymentPay';
import SessionSection from '../session/SessionSection';
import { calculateTotal } from './FormUtils';

const LABEL = {
  Register: 'Registered',
  'Sign Up': 'Signed up',
  Submit: 'Submitted',
  Subscribe: 'Subscribed',
};

const LOADING = 'loading';
const AUTHENTICATION_NEEDED = 'authenticationNeeded';
const SESSION = 'session';
const ADDING = 'adding';
const EDITING = 'editing';
const PAYING = 'paying';
const SUMMARY = 'summary';

const FormItem = (props) => {
  const { className, distinguish, item: form, onClick, verb } = props;
  const classNames = ['item__container', className];
  const timestamp = moment(form.modified).format('MMM Do YYYY');
  let message;
  if (distinguish) {
    message = `${verb} for ${form.name} ${timestamp}`;
  } else {
    message = `${verb} ${timestamp}`;
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="item item--full">
        <button className="button button-plain" onClick={onClick}>
          {message}
        </button>
      </div>
    </div>
  );
};

FormItem.propTypes = {
  className: PropTypes.string,
  distinguish: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  verb: PropTypes.string.isRequired,
};

FormItem.defaultProps = {
  className: undefined,
  distinguish: false,
};

class FormSection extends Component {

  constructor(props) {
    super(props);
    this._nextState = this._nextState.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    // this._onResize = this._onResize.bind(this);
    // this._layout = this._layout.bind(this);
    this.state = { forms: [], state: LOADING };
  }

  componentDidMount() {
    this._load(this.props);
    // window.addEventListener('resize', this._onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
    if ((nextProps.session && !this.props.session) ||
      (!nextProps.session && this.props.session)) {
      this._resetState(nextProps);
    }
  }

  // componentDidUpdate() {
  //   if (this.state.layoutNeeded) {
  //     this.setState({ layoutNeeded: undefined });
  //     this._onResize();
  //   }
  // }

  // componentWillUnmount() {
  //   window.removeEventListener('resize', this._onResize);
  //   clearTimeout(this._layoutTimer);
  // }

  // _onResize() {
  //   clearTimeout(this._layoutTimer);
  //   this._layoutTimer = setTimeout(this._layout, 300);
  // }

  _load(props) {
    const { formTemplate, formTemplateId } = props;
    if (formTemplateId && !formTemplate) {
      getItem('form-templates', formTemplateId._id || formTemplateId)
      .then(formTemplateResponse => this._formTemplateReady(formTemplateResponse))
      .catch(error => console.error('!!! FormSummary formTemplate catch', error));
    } else if (formTemplate) {
      this._formTemplateReady(formTemplate);
    }
  }

  _formTemplateReady(formTemplate) {
    const { session } = this.props;
    this.setState({ formTemplate });
    if (!session && formTemplate.authenticate) {
      this.setState({ state: AUTHENTICATION_NEEDED });
    } else {
      this._loadForms(formTemplate);
    }
  }

  _loadForms(formTemplate) {
    const { session } = this.props;
    if (session) {
      getItems('forms', {
        filter: { formTemplateId: formTemplate._id, userId: session.userId._id },
        populate: true,
      })
      .then((forms) => {
        let paymentFormId;
        if (formTemplate.payable) {
          // see if any require payment
          forms.forEach((form) => {
            const formTotal = calculateTotal(formTemplate, form);
            let paymentTotal = 0;
            (form.paymentIds || []).forEach((payment) => {
              paymentTotal += payment.amount;
            });
            if (formTotal > paymentTotal) {
              form.needsPayment = true;
              if (!paymentFormId) {
                paymentFormId = form._id;
              }
            }
          });
        }
        this.setState({ forms, paymentFormId },
          () => this._resetState(this.props));
      })
      .catch(error => console.error('!!! FormSummary forms catch', error));
    }
  }

  // _layout() {
  //   const contents = this.refs.contents;
  //   const height = contents.offsetHeight;
  //   if (this.state.height !== height) {
  //     this.setState({ height });
  //     // unset height after a while, this allows forms to be dynamic
  //     clearTimeout(this._layoutTimer);
  //     this._layoutTimer = setTimeout(
  //       () => this.setState({ height: undefined }), 600);
  //   }
  // }

  _edit(id) {
    return () => {
      this.setState({ editId: id, state: EDITING });
    };
  }

  _onCancel() {
    this.setState({
      adding: undefined,
      editId: undefined,
      paymentFormId: undefined,
      // layoutNeeded: true,
    });
  }

  _resetState(props) {
    const { session } = props;
    const { formTemplate, forms, editId, paymentFormId } = this.state;
    let state;
    if (!formTemplate || !forms) {
      state = LOADING;
    } else if (!session && formTemplate.authenticate) {
      state = AUTHENTICATION_NEEDED;
    } else if (forms.length === 0) {
      state = ADDING;
    } else if (editId) {
      state = EDITING;
    } else if (paymentFormId) {
      state = PAYING;
    } else {
      state = SUMMARY;
    }
    this.setState({ state });
  }

  _nextState(state) {
    return () => {
      this.setState({ state, editId: undefined, paymentFormId: undefined });
    };
  }

  _onDone() {
    this._resetState(this.props);
    this._loadForms();
  }

  render() {
    const { className, formTemplateId, session } = this.props;
    const {
      formTemplate, forms, editId, height, paymentFormId, state,
    } = this.state;

    const classes = ['form-summary__container'];
    if (className) {
      classes.push(className);
    }

    let formTemplateLink;
    if (session && session.userId.administrator && formTemplate) {
      const formTemplatePath = `/form-templates/${formTemplate._id}`;
      formTemplateLink = (
        <Link className="form-summary__template" to={formTemplatePath}>
          {formTemplate.name}
        </Link>
      );
    }

    let contents;
    switch (state) {

      case LOADING: {
        contents = <Loading />;
        break;
      }

      case AUTHENTICATION_NEEDED: {
        contents = (
          <div className="form-summary">
            <h2>{formTemplate.name}</h2>
            <p>You must sign in to fill out this form.</p>
            <Button label="Sign In"
              onClick={this._nextState(SESSION)} />
          </div>
        );
        break;
      }

      case SESSION: {
        contents = (
          <SessionSection onCancel={this._nextState(AUTHENTICATION_NEEDED)}
            returnPath={window.location.pathname} />
        );
        break;
      }

      case ADDING: {
        const onCancel = forms.length > 0 ? this._nextState(SUMMARY) : undefined;
        contents = (
          <FormAdd formTemplateId={formTemplateId._id || formTemplateId}
            full={false} inline={true}
            onDone={this._onDone} onCancel={onCancel} />
        );
        break;
      }

      case EDITING: {
        contents = (
          <FormEdit id={editId} full={false} inline={true}
            onDone={this._onDone} onCancel={this._nextState(SUMMARY)} />
        );
        break;
      }

      case PAYING: {
        contents = (
          <PaymentPay formId={paymentFormId} formTemplateId={formTemplate._id}
            onDone={this._onDone} onCancel={this._nextState(SUMMARY)} />
        );
        break;
      }

      case SUMMARY: {
        const items = forms.map(form => (
          <li key={form._id}>
            <FormItem item={form} onClick={this._edit(form._id)}
              verb={LABEL[formTemplate.submitLabel] || LABEL.Submit}
              distinguish={forms.length > 1} />
          </li>
        ));

        contents = (
          <div className="form-summary">
            <Button className="form-summary__add" plain={true}
              icon={<AddIcon />} onClick={this._nextState(ADDING)} />
            <div className="form-summary__message">
              <Markdown>
                {formTemplate.postSubmitMessage || `## ${formTemplate.name}`}
              </Markdown>
            </div>
            <ul className="list">
              {items}
            </ul>
          </div>
        );
        break;
      }

      default:
        contents = <Loading />;
    }

    return (
      <div className={classes.join(' ')}
        style={{ height }}>
        <div>
          {contents}
        </div>
        {formTemplateLink}
      </div>
    );
  }
}

FormSection.propTypes = {
  className: PropTypes.string,
  formTemplateId: PropTypes.oneOfType([
    PropTypes.string, PropTypes.object]),
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      _id: PropTypes.string,
    }),
  }),
};

FormSection.defaultProps = {
  className: undefined,
  formTemplateId: undefined,
  session: undefined,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormSection, select);
