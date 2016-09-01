"use strict";
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getUnavailableDates } from '../../actions';
import Button from '../../components/Button';

const NUMBER_OF_WEEKS = 52;

export default class EventDates extends Component {

  constructor () {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._get = this._get.bind(this);
    const today = moment().startOf('day');
    const start = moment(today).subtract(1, 'month').startOf('week');
    const end = moment(start).add(NUMBER_OF_WEEKS, 'weeks');
    this.state = {
      start: start,
      end: end,
      selectedDates: {},
      scroll: false,
      unavailableDates: {},
      weekDayChecked: {}
    };
  }

  componentWillReceiveProps (nextProps) {
    const { formState: { object: event } } = this.props;
    if (event.dates) {
      let selectedDates = {};
      event.dates.forEach(date => {
        date = moment(date);
        selectedDates[date.startOf('day').valueOf()] = true;
      });
      this.setState({ selectedDates: selectedDates });
    };
  }

  componentDidUpdate () {
    const { scroll } = this.state;
    if (scroll) {
      const rect = this.refs.container.getBoundingClientRect();
      window.scrollBy(0, rect.top);
      this.setState({ scroll: false });
    }
  }

  _get () {
    const { formState } = this.props;
    const { active } = this.state;
    const event = formState.object;
    if (active) {
      if (event.resourceIds && event.resourceIds.length > 0) {
        getUnavailableDates(event)
        .then(dates => {
          let unavailableDates = {};
          dates.forEach(date => {
            date = moment(date);
            unavailableDates[date.startOf('day').valueOf()] = true;
          });
          this.setState({ unavailableDates: unavailableDates, scroll : true });
        })
        .catch(error => console.log('!!! EventDates catch', error));
      } else {
        this.setState({ scroll : true });
      }
    }
    if (event.dates) {
      // Prune out any dates before the start date
      const dates = event.dates.filter(date => (
        moment(date).isAfter(this.state.start)));
      formState.set('dates', dates);
    }
  }

  _onToggle () {
    this.setState({ active: ! this.state.active }, this._get);
  }

  _toggleWeekDay (day) {
    return () => {
      const { formState } = this.props;
      const event = formState.object;
      const { start, end } = this.state;

      let weekDayChecked = { ...this.state.weekDayChecked };
      weekDayChecked[day] = ! weekDayChecked[day];
      this.setState({ weekDayChecked: weekDayChecked });

      let dates;
      if (weekDayChecked[day]) {
        // add all dates on the same day of the week
        dates = [];
        let date = moment(start).add(day, 'days');
        while (date < end) {
          if (! event.dates.some(date2 => moment(date2).isSame(date, 'day'))) {
            dates.push(moment(date));
          }
          date.add(1, 'week');
        }
        dates = dates.concat(event.dates);
      } else {
        // remove all dates on the same day of the week
        dates = event.dates.filter(date => date.day() !== day);
      }
      formState.set('dates', dates);
    };
  }

  _renderHeader () {
    const { weekDayChecked } = this.state;
    let days = [];
    let date = moment().startOf('week');
    while (days.length < 7) {
      const name = date.format('ddd');
      const day = date.day();
      days.push(
        <div key={name} className="calendar__day">
          <div className="calendar__day-date">
            <input type="checkbox" checked={weekDayChecked[day] || false}
              onChange={this._toggleWeekDay(day)} />
            <label>{name}</label>
          </div>
        </div>
      );
      date = date.add(1, 'day');
    }
    return (
      <div className="calendar__week">
        {days}
      </div>
    );
  }

  _renderDays () {
    const { formState } = this.props;
    const event = formState.object;
    const { start, end, selectedDates, unavailableDates } = this.state;
    const startValue = moment(event.start).valueOf();

    let weeks = [];
    let days = [];
    const today = moment().startOf('day');
    let date = moment(start);

    while (date.isBefore(end)) {
      const name = date.format(date.date() === 1 ? 'MMM D' : 'D');
      const classNames = ['calendar__day'];
      if (date.isSame(today, 'day')) {
        classNames.push('calendar__day--today');
      }
      if (date.month() % 2 !== today.month() % 2) {
        classNames.push('calendar__day--alternate');
      }

      const dateValue = date.valueOf();
      const checked = selectedDates[dateValue] || (dateValue === startValue);
      const disabled = unavailableDates[dateValue];

      days.push(
        <div key={name} className={classNames.join(' ')}>
          <div className="calendar__day-date">
            <input type="checkbox" checked={checked} disabled={disabled}
              onChange={formState.toggleIn('dates', date.toISOString())} />
            <label>{name}</label>
          </div>
        </div>
      );

      if (7 === days.length) {
        weeks.push(
          <div key={weeks.length} className="calendar__week">{days}</div>
        );
        days = [];
      }

      date.add(1, 'day');
    }

    return weeks;
  }

  render () {
    const { active } = this.state;

    let calendar;
    if (active) {
      calendar = (
        <div className="calendar">
          {this._renderHeader()}
          {this._renderDays()}
        </div>
      );
    }

    return (
      <div ref="container">
        <div type="button" className="form-item">
          <Button secondary={true} label="Recurring dates"
            onClick={this._onToggle} />
        </div>
        {calendar}
      </div>
    );
  }
};

EventDates.propTypes = {
  formState: PropTypes.object.isRequired
};
