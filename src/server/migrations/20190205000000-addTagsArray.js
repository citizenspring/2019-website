'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface
      .addColumn('Groups', 'tags', { type: Sequelize.ARRAY(Sequelize.STRING) })
      .then(() => queryInterface.addColumn('Posts', 'tags', { type: Sequelize.ARRAY(Sequelize.STRING) }))
      .then(() => queryInterface.addColumn('Groups', 'website', { type: Sequelize.STRING }))
      .then(() =>
        queryInterface.addColumn('Groups', 'ParentGroupId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Groups',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          allowNull: true,
        }),
      )
      .then(() => queryInterface.addColumn('Posts', 'geoLocationLatLong', { type: Sequelize.GEOMETRY('POINT') }))
      .then(() => queryInterface.addColumn('Groups', 'type', { type: Sequelize.STRING, defaultValue: 'GROUP' }))
      .then(() => queryInterface.addColumn('Posts', 'type', { type: Sequelize.STRING, defaultValue: 'POST' }));
  },

  down: function(queryInterface) {
    return queryInterface
      .removeColumn('Groups', 'tags')
      .then(() => queryInterface.removeColumn('Groups', 'website'))
      .then(() => queryInterface.removeColumn('Groups', 'type'))
      .then(() => queryInterface.removeColumn('Groups', 'ParentGroupId'))
      .then(() => queryInterface.removeColumn('Posts', 'tags'))
      .then(() => queryInterface.removeColumn('Posts', 'geoLocationLatLong'))
      .then(() => queryInterface.removeColumn('Posts', 'type'));
  },
};
