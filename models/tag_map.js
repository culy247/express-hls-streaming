'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tag_maps = sequelize.define('Tag_maps', {
    video_group_unique_id: DataTypes.STRING,
    tag_id: DataTypes.INTEGER
  }, {});
  Tag_maps.associate = function(models) {
    // associations can be defined here
    //vdeo_groups 테이블과 조인
    Tag_maps.belongsTo(models.Video_groups, {
      foreignKey:'video_group_unique_id',
      targetKey: 'unique_id'
    });
  };
  return Tag_maps;
};