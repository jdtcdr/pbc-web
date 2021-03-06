import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import ImageField from './ImageField';

export default class SectionFields extends Component {

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { allowBackgroundImage, formState } = this.props;
    const { active } = this.state;
    const section = formState.object;

    let result;
    if (active) {
      let backgroundImage;
      if (allowBackgroundImage) {
        backgroundImage = (
          <ImageField label="Background image"
            name="backgroundImage"
            formState={formState}
            property="backgroundImage" />
        );
      }

      result = (
        <div>
          <FormField>
            <input name="full"
              type="checkbox"
              checked={section.full || false}
              onChange={formState.toggle('full')} />
            <label htmlFor="full">Edge to edge</label>
          </FormField>
          <FormField label="Background color">
            <input name="color"
              value={section.color || ''}
              onChange={formState.change('color')} />
          </FormField>
          {backgroundImage}
        </div>
      );
    } else {
      result = (
        <button className="form__more-control button-plain"
          onClick={() => this.setState({ active: true })}>style</button>
      );
    }

    return result;
  }
}

SectionFields.propTypes = {
  allowBackgroundImage: PropTypes.bool,
  formState: PropTypes.object.isRequired,
};

SectionFields.defaultProps = {
  allowBackgroundImage: true,
};
