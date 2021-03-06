import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: calendar } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/calendars/${calendar.path || calendar._id}`}>
      <div className="item">
        <span className="item__name">{calendar.name}</span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Calendars extends List {}

Calendars.defaultProps = {
  ...List.defaultProps,
  category: 'calendars',
  Item,
  path: '/calendars',
  title: 'Calendars',
};
