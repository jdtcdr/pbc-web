"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormState from '../../utils/FormState';
import FormTemplateFieldEdit from './FormTemplateFieldEdit';

const FIELD_TYPES = ['line', 'lines', 'choice', 'choices', 'count',
  'instructions'];

export default class FormTemplateSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = {
      expandedFields: {}, // _id or id
      formState: new FormState(section, onChange),
      newFieldId: 1
    };
  }

  componentWillReceiveProps (nextProps) {
    const { section, onChange } = nextProps;
    this.setState({
      formState: new FormState(section, onChange)
    });
  }

  _addField (type) {
    return this.state.formState.addTo('fields', () => {
      const id = this.state.newFieldId;
      let expandedFields = { ...this.state.expandedFields };
      expandedFields[id] = true;
      this.setState({
        expandedFields: expandedFields,
        newFieldId: this.state.newFieldId + 1
      });
      return { type: type, id: id };
    });
  }

  _toggleField (id) {
    return () => {
      let expandedFields = { ...this.state.expandedFields };
      expandedFields[id] = ! expandedFields[id];
      this.setState({ expandedFields: expandedFields });
    };
  }

  render () {
    const { includeName, dependableFields } = this.props;
    const { formState, expandedFields } = this.state;
    const section = formState.object;

    let sectionFields;
    if (includeName) {
      let dependsOnOptions = dependableFields
      .filter(dependableField => (
        dependableField.sectionId !== (section._id || section.id)
      ))
      .map(dependableField => (
        <option key={dependableField.id} label={dependableField.name}
          value={dependableField.id} />
      ));
      dependsOnOptions.unshift(<option key={0} />);
      sectionFields = (
        <fieldset className="form__fields">
          <FormField label="Section name">
            <input name="name" value={section.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Depends on">
            <select name="dependsOnId" value={section.dependsOnId || ''}
              onChange={formState.change('dependsOnId')}>
              {dependsOnOptions}
            </select>
          </FormField>
          <FormField>
            <input name="child" type="checkbox"
              checked={section.child || false}
              onChange={formState.toggle('child')}/>
            <label htmlFor="child">per child</label>
          </FormField>
          <FormField>
            <input name="administrative" type="checkbox"
              checked={section.administrative || false}
              onChange={formState.toggle('administrative')}/>
            <label htmlFor="administrative">administrative</label>
          </FormField>
        </fieldset>
      );
    }

    const fields = (section.fields || []).map((field, index) => {

      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('fields', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (section.fields.length - 1) ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('fields', index, index+1)}>
          <DownIcon />
        </button>
        ));

      let edit;
      if (expandedFields[field._id] || expandedFields[field.id]) {
        edit = (
          <FormTemplateFieldEdit key={index} field={field} index={index}
            dependableFields={dependableFields}
            onChange={formState.changeAt('fields', index)} />
        );
      }

      return (
        <div key={index}>
          <div className="form-item">
            <button type="button" className="button-plain"
              onClick={this._toggleField(field._id || field.id)}>
              <h4>{field.name || field.type}</h4>
            </button>
            <div className="box--row">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('fields', index)}>
                <TrashIcon />
              </button>
            </div>
          </div>
          {edit}
        </div>
      );
    });

    const addControls = FIELD_TYPES.map(type => (
      <Button key={type} label={`Add ${type}`} secondary={true}
        onClick={this._addField(type)} />
    ));

    return (
      <div>
        {sectionFields}
        {fields}
        <FormFieldAdd>
          {addControls}
        </FormFieldAdd>
      </div>
    );
  }
};

FormTemplateSectionEdit.propTypes = {
  dependableFields: PropTypes.arrayOf(PropTypes.object),
  includeName: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
