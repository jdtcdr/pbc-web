"use strict";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hat from 'hat';
import moment from 'moment';
import { authorize } from './auth';

// /api/sessions

function createSession (user) {
  const Session = mongoose.model('Session');
  const data = {
    administrator: user.administrator,
    administratorDomainId: user.administratorDomainId,
    email: user.email,
    loginAt: new Date(),
    name: user.name,
    token: hat(), // better to encrypt this before storing it, someday
    userId: user._id
  };
  const session = new Session(data);
  return session.save();
}

export default function (router) {
  router.post('/sessions', (req, res) => {
    const User = mongoose.model('User');
    const { email, password } = req.body;
    User.findOne({ email: email })
    .exec()
    .then(user => {
      if (user && user.encryptedPassword &&
        bcrypt.compareSync(password, user.encryptedPassword)) {
        return createSession(user);
      } else {
        return Promise.reject();
      }
    })
    .then(session => res.status(200).json(session))
    .catch(error => res.status(401).json({error: "Invalid email or password"}));
  });

  // This is used when resetting a password
  router.post('/sessions/token', (req, res) => {
    const User = mongoose.model('User');
    const { token } = req.body;
    const date = moment().subtract(2, 'hours');
    User.findOne({
      temporaryToken: token,
      modified: { $gt: date.toString() }
    }).exec()
    .then(user => {
      user.temporaryToken = undefined;
      user.verified = true;
      return user.save();
    })
    .then(user => createSession(user))
    .then(session => res.status(200).json(session))
    .catch(error => res.status(400).json({}));
  });

  router.delete('/sessions/:id', (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      if (session._id.equals(id)) {
        return session.remove();
      } else {
        Promise.reject();
      }
    })
    .then(() => res.status(200).send())
    .catch(error => res.status(401).json({ error: 'Not authorized' }));
  });
};
