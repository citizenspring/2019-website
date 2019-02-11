'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface
      .addColumn('Groups', 'formData', { type: Sequelize.JSONB })
      .then(() => queryInterface.addColumn('Groups', 'path', { type: Sequelize.STRING, allowNull: true }))
      .then(() => queryInterface.addIndex('Groups', ['path', 'slug', 'version'], { unique: true }))
      .then(() => queryInterface.removeColumn('Groups', 'addressLine2'))
      .then(() => queryInterface.renameColumn('Groups', 'addressLine1', 'address'));
  },

  down: function(queryInterface) {
    return queryInterface
      .removeColumn('Groups', 'formData')
      .then(() => queryInterface.addColumn('Groups', 'addressLine2', { type: Sequelize.STRING }))
      .then(() => queryInterface.removeColumn('Groups', 'path'))
      .then(() => queryInterface.renameColumn('Groups', 'address', 'addressLine1'));
  },
};
