"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "SessionParticipants",
      "isPublished",
      "IsPublished"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "SessionParticipants",
      "IsPublished",
      "isPublished"
    );
  },
};
