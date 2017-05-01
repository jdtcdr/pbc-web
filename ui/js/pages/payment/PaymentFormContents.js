import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Markdown from 'markdown-to-jsx';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';

const UserSuggestion = props => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

UserSuggestion.propTypes = {
  item: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

class PaymentFormContents extends Component {

  componentDidMount() {
    const { dispatch, formState, full, session } = this.props;

    if (full && session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }

    this._loadForms(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formState.object._id !== this.props.formState.object._id) {
      this._loadForms(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, full, session } = this.props;
    if (full && session.userId.administrator) {
      dispatch(unloadCategory('domains'));
      dispatch(unloadCategory('forms'));
    }
  }

  _loadForms(props) {
    const { dispatch, formState, full, session } = props;
    const payment = formState.object;

    if (full && session.userId.administrator && payment && payment._id) {
      dispatch(loadCategory('forms', { filter: { paymentIds: payment._id } }));
    }
  }

  render() {
    const {
      className, domains, forms, formState, full, payByCheckInstructions, session,
    } = this.props;
    const payment = formState.object;

    let method;
    if (payByCheckInstructions) {
      let checkInstructions;
      if (payment.method === 'check') {
        checkInstructions = (
          <div className="form-field__text">
            <Markdown>{payByCheckInstructions || ''}</Markdown>
          </div>
        );
      }
      method = (
        <FormField label="Method">
          <div className="box--row">
            <input id="methodPaypal" name="method" type="radio" value="paypal"
              checked={payment.method === 'paypal'}
              onChange={formState.change('method')} />
            <label htmlFor="methodPaypal">paypal</label>
          </div>
          <div className="box--row">
            <input id="methodCheck" name="method" type="radio" value="check"
              checked={payment.method === 'check'}
              onChange={formState.change('method')} />
            <label htmlFor="methodCheck">check</label>
          </div>
          {checkInstructions}
        </FormField>
      );
    }

    const administrator = (session &&
      (session.userId.administrator || (payment.domainId &&
        session.userId.administratorDomainId === payment.domainId)));

    let admin;
    if (full && administrator) {
      let processFields;
      if (payment._id) {
        processFields = [
          <FormField key="sent" label="Sent on">
            <DateInput value={payment.sent || ''}
              onChange={formState.change('sent')} />
          </FormField>,
          <FormField key="received" label="Received on">
            <DateInput value={payment.received || ''}
              onChange={formState.change('received')} />
          </FormField>,
        ];
      }

      let administeredBy;
      if (session.userId.administrator) {
        const options = domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        options.unshift(<option key={0} />);
        administeredBy = (
          <FormField label="Administered by">
            <select name="domainId" value={payment.domainId || ''}
              onChange={formState.change('domainId')}>
              {options}
            </select>
          </FormField>
        );
      }

      let formLinks;
      if (forms && forms.length > 0) {
        const links = forms.map(form2 => (
          <Link key={form2._id} to={`/forms/${form2._id}/edit`}>form</Link>
        ));
        formLinks = (
          <div className="form__footer">
            {links}
          </div>
        );
      }

      admin = (
        <fieldset className="form__fields">
          <div className="form__header">
            <h3>Administrative</h3>
          </div>
          {processFields}
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{ select: 'name email', sort: 'name' }}
              Suggestion={UserSuggestion}
              value={(payment.userId || session).name || ''}
              onChange={suggestion => formState.set('userId', suggestion)} />
          </FormField>
          {administeredBy}
          {formLinks}
        </fieldset>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Amount">
            <div className="box--row">
              <span className="prefix">$</span>
              <input name="amount" type="text" disabled={!administrator}
                value={payment.amount || ''}
                onChange={formState.change('amount')} />
            </div>
          </FormField>
          {method}
          <FormField label="Notes">
            <textarea name="notes" value={payment.notes || ''} rows={2}
              onChange={formState.change('notes')} />
          </FormField>
        </fieldset>
        {admin}
      </div>
    );
  }
}

PaymentFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  forms: PropTypes.array,
  formState: PropTypes.object.isRequired,
  payByCheckInstructions: PropTypes.string,
  full: PropTypes.bool,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
};

PaymentFormContents.defaultProps = {
  className: undefined,
  domains: [],
  forms: undefined,
  full: true,
  payByCheckInstructions: undefined,
};

const select = state => ({
  domains: (state.domains || {}).items,
  session: state.session,
});

export default connect(select)(PaymentFormContents);
