
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PageItem = (props) => {
  const { align, className, item: page } = props;
  const classNames = ['item__container', className];
  const itemClassNames = ['item'];
  if (align) {
    itemClassNames.push(`item--${align}`);
  }
  let path;
  if (page.path === 'home') {
    path = '/';
  } else if (page.path && page.path[0] !== '/') {
    path = `/${page.path}`;
  } else {
    path = `/pages/${page._id}`;
  }
  return (
    <Link className={classNames.join(' ')}
      to={path}>
      <div className={itemClassNames.join(' ')}>
        <span className="item__name">{page.name}</span>
      </div>
    </Link>
  );
};

PageItem.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

PageItem.defaultProps = {
  align: undefined,
  className: undefined,
};

export default PageItem;
