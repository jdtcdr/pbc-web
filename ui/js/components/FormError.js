import React from 'react';
import PropTypes from 'prop-types';

const FormError = (props) => {
  const { message, error } = props;
  const classes = ['form-error'];
  let text;
  if (message) {
    classes.push('form-error--active');
    text = message.error || message;
  } else if (error && error.message) {
    classes.push('form-error--active');
    text = error.message;
  } else if (error && error.errmsg) {
    classes.push('form-error--active');
    text = error.errmsg;
  } else if (typeof error === 'string') {
    classes.push('form-error--active');
    text = error;
  }
  return (
    <div className={classes.join(' ')}>
      <div className="form-error__message">
        {text}
      </div>
    </div>
  );
};

FormError.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
    errmsg: PropTypes.string,
    message: PropTypes.string,
    name: PropTypes.string,
  })]),
};

FormError.defaultProps = {
  message: undefined,
  error: undefined,
};

export default FormError;
