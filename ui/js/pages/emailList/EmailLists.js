import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: emailList } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/email-lists/${emailList.path || emailList._id}`}>
      <div className="item">
        <span className="item__name">{emailList.name}</span>
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

const Suggestion = ({ item: { name, email } }) => (
  <div className="box--between">
    <span>{name}</span>
    <span className="secondary">{email}</span>
  </div>
);

Suggestion.propTypes = {
  item: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default class EmailLists extends List {}

EmailLists.defaultProps = {
  ...List.defaultProps,
  category: 'email-lists',
  filters: [
    {
      property: 'addresses.address',
      suggestionProperty: 'email',
      category: 'users',
      allLabel: 'All',
      select: 'name email',
      Suggestion,
    },
  ],
  Item,
  path: '/email-lists',
  select: 'name path',
  sort: '-modified',
  title: 'Email Lists',
};
