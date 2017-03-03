"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DateTimeInput from '../../components/DateTimeInput';
import ImageField from '../../components/ImageField';
import SectionsFormContents from '../../components/SectionsFormContents';
import EventDates from './EventDates';
import EventDetails from './EventDetails';
import EventResources from './EventResources';

const SECTION_TYPES = [
  'text', 'map', 'image', 'people', 'video', 'form', 'files'
];

export default class EventFormContents extends Component {

  constructor () {
    super();
    this._onStartChange = this._onStartChange.bind(this);
  }

  _onStartChange (start) {
    const { formState } = this.props;
    const event = formState.object;
    let props = {};
    // Set end date to match if unset or earlier
    if (moment.isMoment(start)) {
      if (! event.end || start.isAfter(event.end)) {
        props.end = moment(start).add(1, 'hour').toISOString();
      }
      start = start.toISOString();
    }
    props.start = start;
    formState.set(props);
  }

  render () {
    const { className, formState, session } = this.props;
    const event = formState.object;

    return (
      <div className={className}>

        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={event.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Starts">
            <DateTimeInput value={event.start || ''}
              onChange={this._onStartChange} />
          </FormField>
          <FormField label="Ends">
            <DateTimeInput value={event.end || ''}
              onChange={formState.change('end')} />
          </FormField>
          <FormField label="Location">
            <input name="location" value={event.location || ''}
              onChange={formState.change('location')}/>
          </FormField>
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
        </fieldset>

        <SectionsFormContents formState={formState} types={SECTION_TYPES} />

        <EventDetails formState={formState} session={session} />
        <EventResources formState={formState} session={session} />
        <EventDates formState={formState} session={session} />
      </div>
    );
  }
};

EventFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
