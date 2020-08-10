'use strict';
module.exports = (sequelize, DataTypes) => {
  const Video_groups = sequelize.define('Video_groups', {
    unique_id: DataTypes.STRING,
    title: DataTypes.STRING,
    img: DataTypes.STRING,
    service_yn:DataTypes.BOOLEAN
  }, {});
  Video_groups.associate = function(models) {
    // associations can be defined here
    Video_groups.hasMany(models.Videos, {foreignKey:'video_group_unique_id'});
  };
  return Video_groups;
};