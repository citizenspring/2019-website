'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Post', 'email', { type: Sequelize.JSON });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Post', 'email');
  },
};
