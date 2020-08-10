'use strict';
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const Videos = sequelize.define('Videos', {
    unique_id: DataTypes.STRING,
    list_level: DataTypes.INTEGER,
    video_group_unique_id: DataTypes.STRING,
    title: DataTypes.STRING,
    subscript: DataTypes.TEXT,
    m3u8: DataTypes.STRING,
    release_date: {
      type:DataTypes.DATEONLY,
      get: function(){
        return moment.utc(this.getDataValue('release_date')).format('YYYY-MM-DD');
      }
    },
    view_count:DataTypes.INTEGER
  }, {});
  Videos.associate = function(models) {

  };
  return Videos;
};