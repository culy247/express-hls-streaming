'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admins = sequelize.define('Admins', {
    account: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  Admins.associate = function(models) {
    // associations can be defined here
  };
  return Admins;
};