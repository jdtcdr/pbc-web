"use strict";

export function setFormError (formTemplate, form) {
  let error;
  // check for required fields
  formTemplate.sections.forEach(section => {
    section.fields.forEach(templateField => {
      if (templateField.required) {
        // see if we have it
        if (! form.fields.some(field => (
          field.fieldId === templateField._id && field.value))) {
          if (! error) {
            error = {};
          }
          error[templateField._id] = 'required';
        }
      }
    });
  });
  return error;
}

export function clearFormError (formTemplate, form, error) {
  error = { ...error };
  formTemplate.sections.forEach(section => {
    section.fields.forEach(templateField => {
      if (templateField.required) {
        // see if we have it
        if (form.fields.some(field => (
          field.fieldId === templateField._id && field.value))) {
          delete error[templateField._id];
        }
      }
    });
  });
  return error;
}

export function finalizeForm (formTemplate, form) {
  // find first 'name' field and set form.name to that value
  formTemplate.sections.some(section => {
    section.fields.some(templateField => {
      if (templateField.name && templateField.name.match(/name/i)) {
        form.fields.some(field => {
          if (field.fieldId === templateField._id) {
            form.name = field.value;
            return true;
          }
        });
        return true;
      }
    });
  });
  form.domainId = formTemplate.domainId;
}
