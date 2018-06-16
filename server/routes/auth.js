const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('flash');
const auth = require('../../lib/auth');

const router = express.Router();

//
// ─── AUTHENTICAITON MIDDLEWARE ──────────────────────────────────────────────────
//
router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
}));
router.use(passport.initialize());
router.use(passport.session());
auth.passportHelper(passport);
router.use(flash());

// router.use((req, res, next) => {
//   console.log(req.session);
//   next();
// });


//
// ─── GOOGLE OAUTH ENDPOINTS ─────────────────────────────────────────────────────
//
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'],
  }),
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  },
);

//
// ─── LOCAL AUTH ENDPOINTS ───────────────────────────────────────────────────────
//
router.get('/checklogin', (req, res) => {
  res.status(200).send(req.session.passport);
});

router.post('/subscribe', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureFlash: true,
}), (req, res) => {
  res.status(200).redirect('/');
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureFlash: true,
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
