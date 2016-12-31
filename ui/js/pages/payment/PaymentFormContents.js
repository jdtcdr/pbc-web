"use strict";
import React, { Component, PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';
import { getItem, getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';
import Stored from '../../components/Stored';

const UserSuggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

class PaymentFormContents extends Component {

  constructor () {
    super();
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formId, formTemplateId, formState, full, session } = this.props;

    if (formTemplateId) {
      getItem('form-templates', formTemplateId)
      .then(formTemplate => this.setState({ formTemplate }))
      .catch(error => console.log(
        "!!! PaymentFormContents formTemplate catch", error));
    }

    if (formId) {
      getItem('forms', formId)
      .then(form => this.setState({ form }))
      .catch(error => console.log("!!! PaymentFormContents form catch", error));
    }

    if (full && session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('PaymentFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, full, session } = this.props;
    const { form, formTemplate } = this.state;
    const payment = formState.object;

    // const formFilter = { 'paymentId': payment._id };
    // const formFilterLabel = `Payment`;
    // const formsPath = `/forms?` +
    //   `filter=${encodeURIComponent(JSON.stringify(formFilter))}` +
    //   `&filter-name=${encodeURIComponent(formFilterLabel)}`;

    const admin = (session && (session.administrator || (payment.domainId &&
      session.administratorDomainId === payment.domainId)));

    let administeredBy;
    if (full && session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={payment.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    let user;
    if (full && admin) {
      user = (
        <fieldset className="form__fields">
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{select: 'name email', sort: 'name'}}
              Suggestion={UserSuggestion}
              value={(payment.userId || session).name || ''}
              onChange={(suggestion) => {
                payment.userId = suggestion;
                this.props.onChange(payment);
              }} />
          </FormField>
        </fieldset>
      );
    }

    let checkInstructions;
    if ('check' === payment.method && formTemplate) {
      checkInstructions = (
        <div className="form-field__text">
          {markdownToJSX(formTemplate.payByCheckInstructions || '')}
        </div>
      );
    }

    let processFields;
    if (payment._id) {
      processFields = (
        <fieldset className="form__fields">
          <FormField label="Sent on">
            <DateInput value={payment.sent || ''}
              onChange={formState.change('sent')} />
          </FormField>
          <FormField label="Received on">
            <DateInput value={payment.received || ''}
              onChange={formState.change('received')} />
          </FormField>
          {administeredBy}
        </fieldset>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Amount">
            <div className="box--row">
              <span className="prefix">$</span>
              <input name="amount" type="text" disabled={! admin}
                value={payment.amount || (form || {}).unpaidTotal || ''}
                onChange={formState.change('amount')}/>
            </div>
          </FormField>
          <FormField label="Method">
            <div>
              <input id="methodPaypal" name="method" type="radio" value="paypal"
                checked={'paypal' === payment.method}
                onChange={formState.change('method')} />
              <label htmlFor="methodPaypal">paypal</label>
            </div>
            <div>
              <input id="methodCheck" name="method" type="radio" value="check"
                checked={'check' === payment.method}
                onChange={formState.change('method')} />
              <label htmlFor="methodCheck">check</label>
            </div>
            {checkInstructions}
          </FormField>
          <FormField label="Notes">
            <textarea name="notes" value={payment.notes || ''} rows={2}
              onChange={formState.change('notes')}/>
          </FormField>
        </fieldset>
        {processFields}
        {user}
      </div>
    );
  }
};

PaymentFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  formId: PropTypes.string,
  formTemplateId: PropTypes.string,
  full: PropTypes.bool,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string
  })
};

PaymentFormContents.defaultProps = {
  full: true
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(PaymentFormContents, select);
