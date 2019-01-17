'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Posts', 'email', { type: Sequelize.JSON });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Posts', 'email');
  },
};
