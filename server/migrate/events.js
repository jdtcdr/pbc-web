import mongoose from 'mongoose';
// import moment from 'moment-timezone';
import '../db';
import { loadCategoryArray } from './utils';
import results from './results';

mongoose.Promise = global.Promise;

// Event + Resource

function normalizeResource(item) {
  item.oldId = item.id;
  item.created = item.created_at || undefined;
  item.modified = item.updated_at || undefined;
  return item;
}

function normalizeEvent(item, slaveEvents, reservations) {
  item.oldId = item.id;
  item.created = item.created_at;
  item.modified = item.updated_at;
  item.public = !item.private;
  item.sections = [];
  if (item.notes) {
    item.sections.push({ text: item.notes, type: 'text' });
  }
  // item.text = item.notes;
  // // set date to latest slaveEvent date (if any)
  // let latest;
  // (slaveEvents[item.id] || []).forEach(item2 => {
  //   const startAt = moment(item2.start_at);
  //   if (! latest || startAt.isAfter(latest)) {
  //     latest = startAt;
  //   }
  // });
  // if (latest) {
  //   item.start = latest.format('YYYY-MM-DD') + 'T' +
  //     moment(item.start_at).format('HH:mm:ss');
  //   item.end = latest.format('YYYY-MM-DD') + 'T' +
  //     moment(item.stop_at).format('HH:mm:ss');
  // } else {
  //   item.start = item.start_at;
  //   item.end = item.stop_at;
  // }
  item.start = `${item.start_at}Z`;
  item.end = `${item.stop_at}Z`;
  item.dates = (slaveEvents[item.id] || []).map(item2 => item2.start_at);
  item.resourceIds = (reservations[item.id] || []);
  return item;
}

export default function () {
  const Event = mongoose.model('Event');
  const Resource = mongoose.model('Resource');

  const resources = {}; // oldId => doc
  const slaveEvents = {};
  const reservations = {};
  const eventsData = loadCategoryArray('events');

  return Promise.resolve()
  .then(() => {
    const resourcePromises = [];
    loadCategoryArray('resources').forEach((item) => {
      const promise = Resource.findOne({ oldId: item.id }).exec()
      .then((resource) => {
        if (resource) {
          return results.skipped('Resource', resource);
        }
        item = normalizeResource(item);
        resource = new Resource(item);
        return resource.save()
        .then(resourceSaved => results.saved('Resource', resourceSaved))
        .catch(error => results.errored('Resource', resource, error));
      })
      .then((resource) => { resources[item.id] = resource; });
      resourcePromises.push(promise);
    });
    return Promise.all(resourcePromises);
  })
  .then(() => {
    // organize non-master events by master id
    eventsData.filter(item => item.master_id && item.master_id !== item.id)
    .forEach((item) => {
      if (!slaveEvents[item.master_id]) {
        slaveEvents[item.master_id] = [];
      }
      slaveEvents[item.master_id].push(item);
    });
  })
  .then(() => {
    loadCategoryArray('reservations').forEach((item) => {
      if (!reservations[item.event_id]) {
        reservations[item.event_id] = [];
      }
      reservations[item.event_id].push(resources[item.resource_id]._id);
    });
  })
  .then(() => {
    const promises = [];
    eventsData.filter(item => !item.master_id || item.master_id === item.id)
    .forEach((item) => {
      const promise = Event.findOne({ oldId: item.id }).exec()
      .then((event) => {
        item = normalizeEvent(item, slaveEvents, reservations);
        if (event) {
          return event.update(item)
          .then(eventStored => results.replaced('Event', eventStored))
          .catch(error => results.errored('Event', item, error));
          // return results.skipped('Event', event);
        }
        event = new Event(item);
        return event.save()
        .then(eventSaved => results.saved('Event', eventSaved))
        .catch(error => results.errored('Event', event, error));
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  })
  .then(() => console.log('!!! events done'))
  .catch(error => console.log('!!! events catch', error, error.stack));
}
