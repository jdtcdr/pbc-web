import moment from 'moment-timezone';
import { markdown } from 'markdown';

const BACKGROUND_COLOR = '#cccccc';

function sectionBackground(section) {
  return (section.color ? ` background-color: ${section.color}` : '');
}

function markupText(text, section) {
  const contents = markdown.toHTML(text || '');
  return `<div style="padding: 1px 24px;${sectionBackground(section)}">
  ${contents}
  </div>`;
}

// TODO: combine with code in EventTimes

const formatDate = (date, dayOfWeek = true) =>
  date.format(
    `${dayOfWeek ? 'dddd ' : ''}MMMM Do${date.isSame(moment().startOf('day'), 'year') ? '' : ' YYYY'}`);

const formatTime = (date, ampm = true) =>
  date.format(`${date.minute() === 0 ? 'h' : 'h:mm'}${ampm ? ' a' : ''}`);

const formatTimes = (date1, date2) => {
  const noon = moment(date1).startOf('day').add(12, 'hours');
  const sameAmpm = ((date1.isBefore(noon) && date2.isBefore(noon)) ||
    (date1.isAfter(noon) && date2.isAfter(noon)));
  return `${formatTime(date1, !sameAmpm)} - ${formatTime(date2)}`;
};

function renderDates(event) {
  const start = moment(event.start);
  const end = moment(event.end);
  const now = moment().startOf('day');

  let result;
  if (event.dates && event.dates.length > 0) {
    // Recurring event

    // make into moments
    const dates = event.dates.slice(0).map(date => moment(date));
    // merge start
    if (!dates.some(date => date.isSame(start, 'day'))) {
      dates.push(start);
    }
    // sort
    dates.sort((date1, date2) => {
      if (date1.isBefore(date2)) return -1;
      if (date1.isAfter(date2)) return 1;
      return 0;
    });

    // We consider four kinds of recurrence:
    // 1) multiple consecutive days, such as VBS
    // 2) weekly, such as HS Sundays
    // 3) infrequent but always the same day of the week, such as elders meetings
    // 3) irregular
    // Figure out which kind we have.

    let consecutive = true;
    let weekly = true;
    let sameDayOfWeek = true;
    let previousDate;
    dates.forEach((date) => {
      if (previousDate) {
        if (!moment(date).subtract(1, 'day').isSame(previousDate, 'day')) {
          consecutive = false;
        }
        if (!moment(date).subtract(1, 'week').isSame(previousDate, 'day')) {
          weekly = false;
        }
        if (date.day() !== previousDate.day()) {
          sameDayOfWeek = false;
        }
      }
      previousDate = date;
    });

    if (consecutive) {
      const first = dates[0];
      const last = dates[dates.length - 1];
      result = `${formatDate(first)} - ${formatDate(last)}`;
      if (!event.allDay) {
        result += ` @ ${formatTimes(start, end)}`;
      }
    } else if (weekly) {
      if (event.times && event.times.length > 0) {
        // multiple times
        const secondTime = event.times[0];
        result = `${start.format('dddd[s]')} @ ${formatTimes(start, end)}`;
        if (!event.allDay) {
          result += ` & ${formatTimes(moment(secondTime.start), moment(secondTime.end))}`;
        }
      } else {
        // single time
        result = `${start.format('dddd[s]')}`;
        if (!event.allDay) {
          result += ` @ ${formatTimes(start, end)}`;
        }
      }
    } else if (sameDayOfWeek && dates.length > 4) {
      // not weekly, but regular enough
      // pick the next date in the future
      let nextDate;
      dates.some((date) => {
        if (date.isSameOrAfter(now)) {
          nextDate = date;
        }
        return nextDate;
      });
      if (!nextDate) {
        nextDate = dates[dates.length - 1];
      }
      result = `${formatDate(nextDate)}`;
      if (!event.allDay) {
        result += ` @ ${formatTimes(start, end)}`;
      }
    } else {
      // irreguler
      const datesString = dates.filter(date => date.isSameOrAfter(now))
        .slice(0, 4)
        .map(date => formatDate(date, false)).join(', ');
      result = `${datesString}`;
      if (!event.allDay) {
        result += ` @ ${formatTimes(start, end)}`;
      }
    }
  } else if (!start.isSame(end, 'day')) {
    // multi-day, non-recurring
    if (!event.allDay) {
      result = `${formatDate(start)} @ ${formatTime(start)} to ` +
        `${formatDate(end)} ${formatTime(end)}`;
    } else {
      result = `${formatDate(start)} to ${formatDate(end)}`;
    }
  } else {
    // single day, non-recurring
    result = `${formatDate(start)}`;
    if (!event.allDay) {
      result += ` @ ${formatTimes(start, end)}`;
    }
  }

  return result;
}

function markupEvent(event, section, urlBase) {
  const dates = renderDates(event);
  const url = `${urlBase}/events/${event.path || event._id}`;
  let image = '';
  if (event.image) {
    image = `
<a href="${url}" style="display: block; font-size: 0;"><img style="max-width: 480px;"
src="${urlBase}/api/events/${event._id}/${event.image.name}" /></a>
  `;
  }
  const at = `<div style="padding: 6px 24px;">${dates}</div>`;
  let location = '';
  if (event.location) {
    location = `<div style="color: #999999;">${event.location}</div>`;
  }
  const address = '';
  if (event.address) {
    location = `<div style="color: #999999;">${event.address}</div>`;
  }
  let text;
  if (event.text) {
    text = `<div style="padding: 24px;">${markdown.toHTML(event.text)}</div>`;
  } else {
    text = '<div style="padding-bottom: 24px;"></div>';
  }
  return `
<div style="padding-bottom: 24px;${sectionBackground(section)}">
  ${image}
  <a style="display: block; padding: 24px;
  font-size: 24px; font-weight: 600;" href="${url}">
   ${event.name}</a>
  <div>${at}</div>
  ${location}
  ${address}
  ${text}
  </a>
</div>
  `;
}

function markupMessage(label, message, urlBase) {
  const url = `${urlBase}/messages/${message.path || message._id}`;
  let verses = '';
  if (message.verses) {
    verses = `<div style="padding-top: 6px; color: #999999">${message.verses}</div>`;
  }
  let author = '';
  if (message.author) {
    author = `<div style="padding-top: 6px; color: #999999">${message.author}</div>`;
  }
  return `
<div>
  <h3 style="font-weight: 100; margin-top: 0;">${label}</h3>
  <a style="font-size: 24px; font-weight: 600;" href="${url}">${message.name}</a>
  ${verses}
  ${author}
</div>
  `;
}

function markupPage(page, section, urlBase) {
  const url = `${urlBase}/${page.path || `pages/${page._id}`}`;
  // TODO: revisit this when aligning event and page images and colors
  let image = '';
  if (section.backgroundImage) {
    image = `
<a href="${url}" style="display: block; font-size: 0;"><img style="max-width: 480px;"
src="${section.backgroundImage.data}" /></a>
  `;
  }
  return `
<div style="${sectionBackground(section)}">
  ${image}
  <a style="display: block; padding: 24px;
  font-size: 24px; font-weight: 600;" href="${url}">${page.name}</a>
</div>
  `;
}

function markupFile(file, section, urlBase) {
  const url = `${urlBase}/file/${file._id}/${file.name}`;
  return `
<div style="margin-bottom: 24px;${sectionBackground(section)}">
  <a style="display: block; padding-top: 24px; padding-bottom: 24px;
  font-size: 18px; font-weight: 600;" href="${url}">${file.name}</a>
</a>
  `;
}

export function render(newsletter, urlBase, address) {
  const sections = (newsletter.sections || []).map((section) => {
    switch (section.type) {
      case 'text':
        return markupText(section.text, section);

      case 'image':
        return '<div><img style="max-width: 480px;" ' +
          `src="${urlBase}/api/newsletters/${newsletter._id}/${section.image.name}" />
          </div>`;

      case 'event': {
        const event = section.eventId;
        if (event) {
          return markupEvent(event.toObject(), section, urlBase);
        }
        return '';
      }

      case 'library': {
        const nextMessageMarkup = section.nextMessage ?
          markupMessage('This week', section.nextMessage, urlBase) : '';
        const previousMessageMarkup = section.previousMessage ?
          markupMessage('Last week', section.previousMessage, urlBase) : '';
        return `
<div style="padding: 24px;${sectionBackground(section)}">
${nextMessageMarkup}
${previousMessageMarkup}
</div>
        `;
      }

      case 'pages': return section.pages.filter(page => page).map(page =>
        (page.page ? markupPage(page.page, section, urlBase) : ''));

      case 'files': return section.files.filter(file => file).map(file =>
        (file ? markupFile(file, section, urlBase) : ''));

      default:
        return '<span>TBD</span>';
    }
  }).join('');

  return `
<html>
<head></head>
<body style="margin: 0; padding: 0;
background-color: ${newsletter.color || BACKGROUND_COLOR};">
<div style="background-color: ${newsletter.color || BACKGROUND_COLOR};
padding: 0;">
<div style="max-width: 480px; margin: 0 auto;
box-sizing: border-box;
background-color: #ffffff; color: #333333;
font-family: 'Work Sans', Arial, sans-serif; font-size: 18px;">
<table style="max-width: 480px; width: 100%; padding: 12px 24px;
font-size: 20px; ${newsletter.color ? `background-color: ${newsletter.color}` : ''}">
<tbody><tr>
<td><strong>${newsletter.name}</strong></td>
<td style="text-align: right; color: #666666;">
${moment(newsletter.date).format('MMM Do YYYY')}
</td>
</tr></tbody>
</table>
${sections}
</div>
<div style="padding: 24px; box-sizing: border-box;
max-width: 480px; margin: 0 auto;
background-color: ${newsletter.color || BACKGROUND_COLOR};">
<a style="font-size: 12px;"
href="${urlBase}/email-lists/${address.split('@')[0]}/unsubscribe">
unsubscribe
</a>
</div>
</body>
</html>
  `;
}
