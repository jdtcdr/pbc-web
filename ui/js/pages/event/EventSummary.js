"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import EventTimes from '../../components/EventTimes';
import Section from '../../components/Section';
import Map from '../../components/Map';

export default class EventSummary extends Component {

  constructor (props) {
    super(props);
    this.state = { event: props.event || {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    const { event, id } = props;
    if (id && ! event) {
      getItem('events', id)
      .then(event => this.setState({ event: event }))
      .catch(error => console.log('!!! EventSummary catch', error));
    }
  }

  render () {
    const { color, full, plain } = this.props;
    const { event } = this.state;

    let map;
    if (event.address) {
      map = (
        <div className="event-summary__map">
          <Map address={event.address} plain={true} />
        </div>
      );
    }
    return (
      <Section color={color} full={full} plain={plain}>
        <div className="event-summary">
          <Link to={`/events/${event._id}`} className="link--circle">
            <span className="link__text">{event.name}</span>
          </Link>
          <Link to={`/events/${event._id}`} className="event-summary__summary">
            <EventTimes event={event} />
          </Link>
          {map}
        </div>
      </Section>
    );
  }
};

EventSummary.propTypes = {
  event: PropTypes.object,
  id: PropTypes.string,
  ...Section.propTypes
};
