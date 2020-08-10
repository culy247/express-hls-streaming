'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    unique_id: DataTypes.STRING,
    account_unique_id: DataTypes.STRING,
    nickname: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};