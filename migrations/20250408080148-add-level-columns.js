"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

    await queryInterface.addColumn("SessionParticipants", "GrammarVocabLevel", {
      type: Sequelize.ENUM(...levels),
      allowNull: true,
    });
    await queryInterface.addColumn("SessionParticipants", "ReadingLevel", {
      type: Sequelize.ENUM(...levels),
      allowNull: true,
    });
    await queryInterface.addColumn("SessionParticipants", "ListeningLevel", {
      type: Sequelize.ENUM(...levels),
      allowNull: true,
    });
    await queryInterface.addColumn("SessionParticipants", "SpeakingLevel", {
      type: Sequelize.ENUM(...levels),
      allowNull: true,
    });
    await queryInterface.addColumn("SessionParticipants", "WritingLevel", {
      type: Sequelize.ENUM(...levels),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "SessionParticipants",
      "GrammarVocabLevel"
    );
    await queryInterface.removeColumn("SessionParticipants", "ReadingLevel");
    await queryInterface.removeColumn("SessionParticipants", "ListeningLevel");
    await queryInterface.removeColumn("SessionParticipants", "SpeakingLevel");
    await queryInterface.removeColumn("SessionParticipants", "WritingLevel");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessionParticipants_GrammarVocabLevel";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessionParticipants_ReadingLevel";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessionParticipants_ListeningLevel";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessionParticipants_SpeakingLevel";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessionParticipants_WritingLevel";'
    );
  },
};
