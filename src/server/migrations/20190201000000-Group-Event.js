'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS postgis;')
      .then(() => queryInterface.changeColumn('Users', 'country', 'countryCode', { type: Sequelize.STRING(2) }))
      .then(() => queryInterface.addColumn('Groups', 'geoLocationLatLong', { type: Sequelize.GEOMETRY('POINT') }))
      .then(() => queryInterface.addColumn('Groups', 'locationName', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Groups', 'addressLine1', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Groups', 'addressLine2', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Groups', 'zipcode', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Groups', 'city', { type: Sequelize.STRING }))
      .then(() => queryInterface.addColumn('Groups', 'countryCode', { type: Sequelize.STRING(2) }))
      .then(() => queryInterface.addColumn('Groups', 'startsAt', { type: Sequelize.DATE }))
      .then(() => queryInterface.addColumn('Groups', 'endsAt', { type: Sequelize.DATE }));
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface
      .removeColumn('Groups', 'geoLocationLatLong')
      .then(() => queryInterface.removeColumn('Groups', 'locationName'))
      .then(() => queryInterface.removeColumn('Groups', 'addressLine1'))
      .then(() => queryInterface.removeColumn('Groups', 'addressLine2'))
      .then(() => queryInterface.removeColumn('Groups', 'zipcode'))
      .then(() => queryInterface.removeColumn('Groups', 'city'))
      .then(() => queryInterface.removeColumn('Groups', 'countryCode'))
      .then(() => queryInterface.removeColumn('Groups', 'startsAt'))
      .then(() => queryInterface.removeColumn('Groups', 'endsAt'))
      .then(() => queryInterface.changeColumn('Users', 'countryCode', 'country', { type: Sequelize.STRING }))
      .then(() => queryInterface.sequelize.query('DROP EXTENSION postgis;'));
  },
};
