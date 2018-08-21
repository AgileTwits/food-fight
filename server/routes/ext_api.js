const express = require('express');
const request = require('request');

const router = express.Router();

//
// ─── EXTERNAL API LOGIC ─────────────────────────────────────────────────────────
//
router.post('/api/search', (req, res) => {
  console.log('Received request for Yelp search of', req.body);
  const { zip } = req.body;
  const options = {
    method: 'GET',
    uri: 'https://api.yelp.com/v3/businesses/search',
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
    },
    qs: {
      location: zip,
    },
  };
  request(options, (err, data) => {
    if (err) {
      console.log('Error in interacting with the Yelp API', err);
      res.status(404).end();
    }
    res.send(JSON.parse(data.body));
  });
});

router.post('/api/search/restaurant', (req, res) => {
  const { restId } = req.body;
  console.log('Fetching restaurant details for ', restId);
  const options = {
    method: 'GET',
    uri: `https://api.yelp.com/v3/businesses/${restId}`,
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
    },
  };
  request(options, (err, data) => {
    if (err) {
      console.log('Error getting restaurant details', err);
      res.status(404).end();
    }
    res.send(JSON.parse(data.body));
  });
});

module.exports = router;
