import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import TextHelp from './TextHelp';
import FormState from '../utils/FormState';
import SectionEdit from './SectionEdit';

export default class TextSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange),
    });
  }

  render() {
    const { formState } = this.state;
    const section = formState.object;

    return (
      <SectionEdit formState={formState}>
        <FormField name="text" label="Text" help={<TextHelp />}>
          <textarea name="text"
            value={section.text || ''}
            rows={8}
            onChange={formState.change('text')} />
        </FormField>
      </SectionEdit>
    );
  }
}

TextSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
