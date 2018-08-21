const express = require('express');
const uniqueString = require('unique-string');
const dbHelpers = require('../../db-controllers');
const tock = require('tocktimer');

const router = express.Router();

const timerObj = {};
const nominateTimerObj = {};

//
// ─── CREATE ROOMS AND GET ROOM INFO ─────────────────────────────────────────────
//

router.post('/api/save', (req, res) => {
  // console.log('NEW ROOM DATA', req.body);
  const { roomName, zip, members } = req.body;
  const roomUnique = uniqueString();
  timerObj[roomUnique] = new tock({
    countdown: true,
    complete: () => {
      console.log('TIMER OVER');
      dbHelpers.saveWinner(roomUnique);
    }
  });
  timerObj[roomUnique].start(180000);

  dbHelpers.saveRoomAndMembers(roomName, zip, members, roomUnique, (err, room, users) => {
    if (err) {
      console.log('Error saving room and members', err);
    } else {
      console.log(`Saved room: ${roomName}`);
      res.send(room[0].dataValues);
    }
  });
});

router.get('/api/rooms/:roomID', (req, res) => {
  const { roomID } = req.params;
  dbHelpers.getRoomMembers(roomID, (err, roomMembers) => {
    if (err) {
      console.log('Error getting room members', err);
    } else {
      console.log(`Got for ${roomID} roommembers: ${JSON.stringify(roomMembers)}`)
      res.send(roomMembers);
    }
  });
});

router.get('/api/timer/:roomID', (req, res) => {
  const { roomID } = req.params;
  res.send({ timeLeft: timerObj[roomID].lap() });
});

router.get('/api/nominatetimer/:roomID', (req, res) => {
  const { roomID } = req.params;
  res.send({ timeLeft: nominateTimerObj[roomID].lap() });
});

router.post('/room-redirect', (req, res) => {
  console.log(req.body);
  res.redirect(307, `/rooms/${req.body.id}`);
});

// Joseph
router.post('/api/userrooms', (req, res) => {
  const { username } = req.body;
  dbHelpers.getRooms(username, (err, rooms) => {
    if (err) {
      console.log('Error getting rooms', err);
    } else {
      res.send(rooms);
    }
  });
});

router.post('/api/userwins', (req, res) => {
  const { username } = req.body;
  dbHelpers.getWins(username, (err, wins) => {
    if (err) {
      console.log('Error getting wins', err);
    } else {
      res.send(wins);
    }
  });
});

router.get('/api/getWinner/:roomID', (req, res) => {
  const { roomID } = req.params;
  dbHelpers.getWinner(roomID, (response) => {
    console.log('WINNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNER', response);
    res.send(response);
  });
});

//
// ─── HANDLE MESSAGES AND VOTES─────────────────────────────────────────────────────────
//
router.post('/api/messages', (req, res) => {
  const { user_id, message, roomID } = req.body;
  console.log('NOMIIIIIIINNNNNNNNNNNATION TIMER', nominateTimerObj);
  dbHelpers.saveMessage(user_id, message.name, message.message, roomID, (err, savedMessage) => {
    if (err) {
      console.log('Error saving message', err);
      res.status(404).end();
    } else {
      res.end('Message saved', savedMessage);
    }
  });
});

router.get('/api/messages/:roomID', (req, res) => {
  const { roomID } = req.params;
  dbHelpers.getMessages(roomID, (err, fetchedMessages) => {
    if (err) {
      console.log('Error retrieving messages', err);
      res.status(404).end();
    } else {
      console.log('Messages retrieved!', fetchedMessages);
      res.send(fetchedMessages);
    }
  });
});

router.post('/api/nominate', (req, res) => {
  const { name, roomID, restaurantID } = req.body;
  // Timer for nominations
  nominateTimerObj[roomID] = new tock({
    countdown: true,
    complete: () => {
      console.log('TIMER OVER');
    }
  });
  nominateTimerObj[roomID].start(15000);

  console.log('NOMIIIIIIINNNNNNNNNNNATION TIMER', nominateTimerObj[roomID]);

  dbHelpers.saveRestaurant(name, roomID, (err, restaurant) => {
    if (err) {
      console.log('Error saving restaurant', err);
    } else {
      res.end('Restaurant saved!', restaurant);
    }
  });

  // Joseph SQL
  dbHelpers.saveCurrentRestaurant(roomID, restaurantID, (err, restaurant) => {
    if (err) {
      console.log('Error saving current restaurant', err);
    } else {
      res.end('Current restaurant saved!', restaurant);
    }
  });
});

router.post('/api/currentrestaurant', (req, res) => {
  const { roomID } = req.body;
  // Joseph SQL
  dbHelpers.getCurrentRestaurant(roomID, (err, restaurant) => {
    if (err) {
      console.log('Error retrieving current restaurant', err);
    } else {
      res.send(restaurant);
    }
  });

});

router.post('/api/votes', (req, res) => {
  const { name, roomID, voter, restaurant_id, nominator } = req.body;
  dbHelpers.updateVotes(voter, restaurant_id, name, roomID, nominator, (err, restaurant) => {
    if (err) {
      console.log('Error upvoting restaurant', err);
    } else {
      res.end('Restaurant upvoted!', restaurant);
    }
  });
});

router.post('/api/vetoes', (req, res) => {
  const { name, roomID, voter, restaurant_id } = req.body;
  dbHelpers.updateVetoes(voter, restaurant_id, name, roomID, (err, restaurant) => {
    if (err) {
      console.log('Error vetoing restaurant', err);
    } else {
      res.end('Restaurant vetoed!', restaurant);
    }
  });
});

router.get('/api/votes/:roomID', (req, res) => {
  const { roomID } = req.params;
  dbHelpers.getScoreboard(roomID, (err, scores) => {
    if (err) {
      console.log('Error fetching scoreboard', err);
    } else {
      res.send(scores);
    }
  });
});


module.exports = router;
