"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';

export default class SectionFields extends Component {

  render () {
    const { formState } = this.props;
    const section = formState.object;

    return (
      <div>
        <FormField>
          <input name="full" type="checkbox"
            checked={section.full || false}
            onChange={formState.toggle('full')}/>
          <label htmlFor="full">Edge to edge</label>
        </FormField>
        <FormField label="Background color">
          <input ref="color" name="color" value={section.color || ''}
            onChange={formState.change('color')}/>
        </FormField>
        <ImageField label="Background image" name="backgroundImage"
          formState={formState} property="backgroundImage" />
      </div>
    );
  }
}

SectionFields.propTypes = {
  formState: PropTypes.object.isRequired
};
