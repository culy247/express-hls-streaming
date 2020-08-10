'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Videos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      list_level:{
        allowNull:false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      video_group_unique_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      subscript: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      m3u8: {
        allowNull: false,
        type: Sequelize.STRING
      },
      release_date: {
        allowNull: false,
        defaultValue : Sequelize.fn('NOW'),
        type: Sequelize.DATE
      },
      view_count: {
        allowNull:false,
        defaultValue:0,
        type:Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Videos');
  }
};