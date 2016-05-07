"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';

const TextSection = (props) => {
  const { section } = props;
  return (
    <div className="page__text">
      {markdownToJSX(section.text)}
    </div>
  );
};

TextSection.defaultProps = {
  section: PropTypes.object.isRequired
};

export default TextSection;
