"use strict";
import { dispatch } from './store';

let _headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
let _sessionId;

const processStatus = (response) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return response.json().then(json => Promise.reject(json || response.statusText));
  }
};

// Session

const setSession = (session) => {
  _sessionId = session._id;
  _headers.Authorization = `Token token=${session.token}`;
  dispatch(state => ({ session: session }));
  localStorage.session = JSON.stringify(session);
  return session;
};

const clearSession = (object) => {
  _sessionId = undefined;
  delete _headers.Authorization;
  dispatch(state => ({ session: undefined }));
  localStorage.removeItem('session');
  return object;
};

export function initialize () {
  if (localStorage.session) {
    const session = JSON.parse(localStorage.session);
    setSession(session);
  }
}

export function postSession (session) {
  return fetch('/api/sessions', {
    method: 'POST', headers: _headers, body: JSON.stringify(session) })
  .then(processStatus)
  .then(response => response.json())
  .then(setSession);
}

export function deleteSession () {
  return fetch(`/api/sessions/${_sessionId}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus)
  .catch(clearSession);
}

// Generic

export function getItems (category, options={}) {
  const params = [];
  if (options.search) {
    params.push(`search=${encodeURIComponent(options.search)}`);
  }
  if (options.filter) {
    params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
  }
  if (options.sort) {
    params.push(`sort=${encodeURIComponent(options.sort)}`);
  }
  if (options.distinct) {
    params.push(`distinct=${encodeURIComponent(options.distinct)}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}`: '';
  return fetch(`/api/${category}${q}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}

export function postItem (category, item) {
  return fetch(`/api/${category}`, {
    method: 'POST', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function getItem (category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'GET', headers: _headers })
  .then(processStatus)
  .then(response => response.json());
}

export function putItem (category, item) {
  return fetch(`/api/${category}/${encodeURIComponent(item._id)}`, {
    method: 'PUT', headers: _headers, body: JSON.stringify(item) })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteItem (category, id) {
  return fetch(`/api/${category}/${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}

// User

export function postSignUp (user) {
  return fetch('/api/users/sign-up', {
    method: 'POST', headers: _headers, body: JSON.stringify(user) })
  .then(processStatus)
  .then(response => response.json());
}

// Site

export function getSite () {
  return fetch('/api/site', { method: 'GET', headers: _headers })
  .then(response => response.json());
}

export function postSite (site) {
  return fetch('/api/site', {
    method: 'POST', headers: _headers, body: JSON.stringify(site) })
  .then(processStatus)
  .then(response => response.json());
}

// Calendar

export function getCalendar (options={}) {
  let params = [];
  if (options.searchText) {
    params.push(`search=${encodeURIComponent(options.searchText)}`);
  }
  if (options.date) {
    params.push(`date=${encodeURIComponent(options.date.toISOString())}`);
  }
  if (options.filter) {
    params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(`/api/calendar${q}`, {
    method: 'GET', headers: _headers })
  .then(response => response.json());
}

// Events

export function getResources (event) {
  return fetch('/api/events/resources', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

export function getUnavailableDates (event) {
  return fetch('/api/events/unavailable-dates', {
    method: 'POST', headers: _headers, body: JSON.stringify(event) })
  .then(response => response.json());
}

// Map

export function getGeocode (address) {
  const query = `?q=${encodeURIComponent(address)}&format=json`;
  return fetch(`http://nominatim.openstreetmap.org/search${query}`, {
    method: 'GET', headers: { ..._headers, Authorization: undefined }})
  .then(response => response.json());
}

// Files

export function postFile (data) {
  let headers = {..._headers};
  delete headers['Content-Type'];
  return fetch('/api/files', { method: 'POST', headers: headers, body: data })
  .then(processStatus)
  .then(response => response.json());
}

export function deleteFile (id) {
  return fetch(`/api/files/${id}`, {
    method: 'DELETE', headers: _headers })
  .then(processStatus);
}
