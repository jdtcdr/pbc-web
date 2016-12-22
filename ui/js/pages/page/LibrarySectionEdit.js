"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionEdit from './SectionEdit';

export default class LibrarySectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), libraries: [] };
  }

  componentDidMount () {
    getItems('libraries', { sort: 'name' })
    .then(response => this.setState({ libraries: response }))
    .catch(error => console.log('LibrarySectionEdit catch', error));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const libraryOptions = this.state.libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));

    let value = '';
    if (section.libraryId) {
      if (typeof section.libraryId === 'string') {
        value = section.libraryId;
      } else {
        value = section.libraryId._id;
      }
    }

    return (
      <SectionEdit formState={formState}>
        <FormField label="Library">
          <select name="libraryId" value={value}
            onChange={formState.change('libraryId')}>
            {libraryOptions}
          </select>
        </FormField>
      </SectionEdit>
    );
  }
};

LibrarySectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
