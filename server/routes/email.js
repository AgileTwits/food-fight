const express = require('express');

const Mailjet = require('node-mailjet').connect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET,
);

const db = require('../../database-postgresql/models/index');

const { Op } = db;

const router = express.Router();

//
// ─── USER SEARCH AND INVITE ─────────────────────────────────────────────────────
//
router.post('/searchUsers', (req, res) => {
  console.log(req.body.query);
  db.models.User.findAll({
    limit: 10,
    where: {
      email: {
        [Op.regexp]: req.body.query,
      },
    },
  })
    .then(matches => res.status(200).send(matches))
    .catch(err => res.status(200).send(err));
});

//
// ─── SERVE EMAIL INVITATIONS ────────────────────────────────────────────────────
//
router.post('/api/signupEmail', (req, res) => {
  console.log('Received request to send email to', req.body.email);
  const { email } = req.body;
  const emailData = {
    FromEmail: 'foodfightHR@gmail.com',
    FromName: 'Food Fight',
    Subject: 'You\'ve been invited to Food Fight!',
    'Text-part': `You've been invited to a Food Fight. Visit ${process.env.DOMAIN || 'http://localhost:3000/'}signup to signup.`,
    Recipients: [{ Email: email }],
  };
  Mailjet.post('send')
    .request(emailData)
    .then(() => {
      res.end('Email sent!');
    })
    .catch((err) => {
      console.log('Error in interacting with the MailJet API', err);
      res.status(404).end();
    });
});

router.post('/api/roomEmail', (req, res) => {
  console.log('Received request to send email to', req.body);
  const { email, roomInfo } = req.body;
  const emailData = {
    FromEmail: 'foodfightHR@gmail.com',
    FromName: 'Food Fight',
    Subject: 'You\'ve been invited to join a Food Fight room!',
    'Text-part': `You've been invited to a Food Fight room. Visit ${process.env.DOMAIN || 'http://localhost:3000/'}rooms/${roomInfo.uniqueid} to join.`,
    Recipients: [{ Email: email }],
  };
  Mailjet.post('send')
    .request(emailData)
    .then(() => {
      res.end('Email sent!');
    })
    .catch((err) => {
      console.log('Error in interacting with the MailJet API', err);
      res.status(404).end();
    });
});

module.exports = router;
