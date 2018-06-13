module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('vote', {
    restaurant_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    upvoted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return Vote;
};
