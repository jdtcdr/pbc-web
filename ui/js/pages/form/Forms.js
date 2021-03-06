
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: form, session } = props;
  const classNames = ['item__container', className];
  let name;
  if (session.userId.administrator ||
    (session.userId.domainIds && session.userId.domainIds.length > 0)) {
    name = (
      <span className="box--row">
        <span>{form.name || (form.userId || {}).name}</span>
        <span className="tertiary">{(form.formTemplateId || {}).name}</span>
      </span>
    );
  } else {
    name = (
      <span>{(form.formTemplateId || { name: '?' }).name}</span>
    );
  }
  return (
    <Link className={classNames.join(' ')}
      to={`/forms/${form._id}/edit`}>
      <div className="item">
        {name}
        <span className="secondary">
          {moment(form.modified).format('MMM Do YYYY')}
        </span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

const Forms = (props) => {
  const { history, location, session } = props;
  const populate = [
    { path: 'formTemplateId', select: 'name' },
    { path: 'userId', select: 'name' },
  ];

  let filters;
  if (session &&
    (session.userId.administrator || session.userId.domainIds.length > 0)) {
    filters = [{
      property: 'formTemplateId',
      category: 'form-templates',
      allLabel: 'All templates',
    }, {
      property: 'userId', category: 'users', allLabel: 'Anyone',
    }];
  }

  return (
    <List history={history}
      location={location}
      category="forms"
      title="Forms"
      path="/forms"
      filters={filters}
      sort="-modified"
      populate={populate}
      addIfFilter="formTemplateId"
      Item={Item} />
  );
};

Forms.propTypes = {
  history: PropTypes.any.isRequired,
  location: PropTypes.object.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

Forms.defaultProps = {
  session: undefined,
};

const select = state => ({
  session: state.session,
});

export default connect(select)(Forms);
