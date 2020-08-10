'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category_maps = sequelize.define('Category_maps', {
    video_group_unique_id: DataTypes.STRING,
    category_id: DataTypes.INTEGER
  }, {});
  Category_maps.associate = function(models) {
    // associations can be defined here
    //vdeo_groups 테이블과 조인
    Category_maps.belongsTo(models.Video_groups, {
      foreignKey:'video_group_unique_id',
      targetKey: 'unique_id'
    });
  };
  return Category_maps;
};