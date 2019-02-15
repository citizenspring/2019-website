'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface
      .addColumn('Groups', 'formData', { type: Sequelize.JSONB })
      .then(() => queryInterface.addColumn('Posts', 'locationName', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Posts', 'address', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Posts', 'zipcode', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Posts', 'city', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Posts', 'website', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Posts', 'countryCode', { type: Sequelize.STRING(2) }))
      .then(() => queryInterface.addColumn('Posts', 'startsAt', { type: Sequelize.DATE }))
      .then(() => queryInterface.addColumn('Posts', 'endsAt', { type: Sequelize.DATE }))
      .then(() => queryInterface.addColumn('Posts', 'formData', { type: Sequelize.JSONB }))
      .then(() => queryInterface.addColumn('Posts', 'settings', { type: Sequelize.JSONB }))
      .then(() => queryInterface.removeColumn('Groups', 'addressLine2'))
      .then(() => queryInterface.renameColumn('Groups', 'addressLine1', 'address'));
  },

  down: function(queryInterface) {
    return queryInterface
      .removeColumn('Groups', 'formData')
      .then(() => queryInterface.removeColumn('Posts', 'locationName'))
      .then(() => queryInterface.removeColumn('Posts', 'address'))
      .then(() => queryInterface.removeColumn('Posts', 'zipcode'))
      .then(() => queryInterface.removeColumn('Posts', 'city'))
      .then(() => queryInterface.removeColumn('Posts', 'website'))
      .then(() => queryInterface.removeColumn('Posts', 'countryCode'))
      .then(() => queryInterface.removeColumn('Posts', 'startsAt'))
      .then(() => queryInterface.removeColumn('Posts', 'endsAt'))
      .then(() => queryInterface.removeColumn('Posts', 'formData'))
      .then(() => queryInterface.removeColumn('Posts', 'settings'))
      .then(() => queryInterface.addColumn('Groups', 'addressLine2', { type: Sequelize.STRING }))
      .then(() => queryInterface.renameColumn('Groups', 'address', 'addressLine1'));
  },
};
