const db = require('../database-postgresql/models');
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string');

const saveMember = (email, password, zipcode, callback) => {
  let hashedPW;
  if (password) {
    const salt = bcrypt.genSaltSync(3);
    hashedPW = bcrypt.hashSync(password, salt);
  }
  db.models.User.create({
    email,
    password: hashedPW,
    zipcode,
  })
    .then((result) => {
      callback(result);
    })
    .catch((error) => {
      console.log(error);
    });
};

const saveRoomAndMembers = (roomName, zip, members, callback) => {
  const promisedMembers = members.map(memberEmail => db.models.User.findOne({
    where: {
      email: memberEmail,
    },
  }));

  db.models.Room.findOrCreate({
    where: {
      name: roomName,
      uniqueid: uniqueString(),
      zipcode: zip,
    },
  })
    .then((room) => {
      Promise.all(promisedMembers)
        .then((users) => {
          users.forEach((user) => {
            room[0].addUser(user);
          });
          callback(null, room, users);
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

// const saveMessage = (name, message, roomID, callback) => {
//   console.log('Saving message', name, message, roomID);
//   db.models.Message.create({
//     name,
//     message,
//     room_id: roomID,
//   })
//     .then(() => {
//       callback(null);
//     })
//     .catch((error) => {
//       callback(error);
//     });
// };

// const getMessages = (roomID, callback) => {
//   db.models.Message.findAll({
//     where: { room_id: roomID },
//   })
//     .then((results) => {
//       callback(null, results);
//     })
//     .catch((error) => {
//       callback(error);
//     });
// };

const getRoomMembers = (roomID, callback) => {
  db.models.User.findAll({
    attributes: ['email', 'zipcode'],
    include: [{
      model: db.models.Room,
      where: { uniqueid: roomID },
      attributes: ['name', 'zipcode'],
      through: { attributes: [] },
    }],
  })
    .then((users) => {
      console.log('Success getting users', users);
      callback(null, users);
    })
    .catch((error) => {
      callback(error);
    });
};

module.exports = { saveMember, saveRoomAndMembers, getRoomMembers };