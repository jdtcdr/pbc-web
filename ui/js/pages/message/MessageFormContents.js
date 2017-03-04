
import React, { Component, PropTypes } from 'react';
import { getItems, postFile, deleteFile } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import ImageField from '../../components/ImageField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';
import TextHelp from '../../components/TextHelp';
import TrashIcon from '../../icons/Trash';

export default class MessageFormContents extends Component {

  constructor() {
    super();
    this._onAddFile = this._onAddFile.bind(this);
    this._renderFile = this._renderFile.bind(this);
    this._changeFileProperty = this._changeFileProperty.bind(this);
    this._onChangeSeries = this._onChangeSeries.bind(this);
    this.state = { domains: [], libraries: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('MessageFormContents domains catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }

    getItems('libraries', { sort: 'name' })
    .then(libraries => this.setState({ libraries }))
    .catch(error => console.error('MessageFormContents libraries catch', error));
  }

  _onAddFile() {
    const message = this.props.formState.object;
    const files = (message.files || []).slice(0);
    files.push({});
    this.props.formState.set('files', files);
  }

  _removeFile(index) {
    return () => {
      const message = this.props.formState.object;
      const files = (message.files || []).slice(0);
      const file = files[index];
      deleteFile(file._id);
      files.splice(index, 1);
      this.props.formState.set('files', files);
    };
  }

  _changeFile(index) {
    return (event) => {
      const message = this.props.formState.object;
      const files = event.target.files;
      const data = new FormData();
      data.append('file', files[0]);
      postFile(data)
      .then((file) => {
        const nextFiles = (message.files || []).slice(0);
        nextFiles[index] = file;
        // console.log('!!! file upload completed', file);
        this.props.formState.set('files', nextFiles);
      })
      .catch(error => console.error('!!! File upload catch', error));
    };
  }

  _changeFileProperty(index, property) {
    return (event) => {
      const message = this.props.formState.object;
      const files = (message.files || []).slice(0);
      const file = files[index];
      file[property] = event.target.value;
      this.props.formState.set('files', files);
    };
  }

  _onChangeSeries(suggestion) {
    const { formState } = this.props;
    let value;
    if (suggestion) {
      value = { _id: suggestion._id, name: suggestion.name };
    } else {
      value = undefined;
    }
    formState.set('seriesId', value);
  }

  _renderFile(file, index) {
    const closeControl = (
      <button type="button" className="button-icon"
        onClick={this._removeFile(index)}>
        <TrashIcon secondary={true} />
      </button>
    );

    let fileField;
    if (file._id) {
      fileField = (
        <FormField name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <div className="box--row">
            <span className="input">{file.name || file._id}</span>
          </div>
        </FormField>
      );
    } else {
      fileField = (
        <FormField name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <input name={`file-${index}`} type="file"
            onChange={this._changeFile(index)} />
        </FormField>
      );
    }

    return (
      <div key={index}>
        {fileField}
        <FormField label="Label">
          <input name={`label-${index}`} value={file.label || ''}
            onChange={this._changeFileProperty(index, 'label')} />
        </FormField>
      </div>
    );
  }

  render() {
    const { className, formState, session } = this.props;
    const { domains, libraries } = this.state;
    const message = formState.object;

    let files;
    if (message.files) {
      files = message.files.map(this._renderFile);
    }

    let seriesField;
    if (!message.series) {
      seriesField = (
        <FormField name="seriesId" label="In Series">
          <SelectSearch category="messages" clearable={true}
            options={{ filter: { series: true } }}
            value={(message.seriesId || {}).name || ''}
            onChange={this._onChangeSeries} />
        </FormField>
      );
    }

    let nonSeriesField;
    if (!message.seriesId) {
      nonSeriesField = (
        <FormField>
          <input name="series" type="checkbox"
            checked={message.series || false}
            onChange={formState.toggle('series')} />
          <label htmlFor="series">This is a series</label>
        </FormField>
      );
    }

    let administeredBy;
    if (session.administrator) {
      const domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={message.domainId || ''}
            onChange={formState.change('domainId')}>
            {domainOptions}
          </select>
        </FormField>
      );
    }

    const libraryOptions = libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));
    libraryOptions.unshift(<option key={0} />);

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={message.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Author">
            <input name="author" value={message.author || ''}
              onChange={formState.change('author')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={message.date || ''}
              onChange={formState.change('date')} />
          </FormField>
          <FormField label="Verses">
            <input name="verses" value={message.verses || ''}
              onChange={formState.change('verses')} />
          </FormField>
        </fieldset>
        <fieldset className="form__fields">
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
          <FormField name="text" label="Text" help={<TextHelp />}>
            <textarea name="text" value={message.text || ''} rows={4}
              onChange={formState.change('text')} />
          </FormField>
          <FormField label="Video URL">
            <input name="videoUrl" value={message.videoUrl || ''}
              onChange={formState.change('videoUrl')} />
          </FormField>
          {files}
          <FormFieldAdd>
            <button type="button" className="button button--secondary"
              onClick={this._onAddFile}>
              Add file
            </button>
          </FormFieldAdd>
        </fieldset>
        <fieldset className="form__fields">
          {seriesField}
          {nonSeriesField}
          <FormField label="Library">
            <select name="libraryId" value={message.libraryId || ''}
              onChange={formState.change('libraryId')}>
              {libraryOptions}
            </select>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={message.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

MessageFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

MessageFormContents.defaultProps = {
  className: undefined,
};
