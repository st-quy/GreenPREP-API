"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy danh sách SessionID và UserID từ database để liên kết
    const sessions = await queryInterface.sequelize.query(
      `SELECT "ID" FROM "Sessions" LIMIT 5;`
    );
    const users = await queryInterface.sequelize.query(
      `SELECT "ID" FROM "Users" LIMIT 5;`
    );

    const sessionIds = sessions[0].map((session) => session.ID);
    const userIds = users[0].map((user) => user.ID);

    const { v4: uuidv4 } = require("uuid");
    const id1 = uuidv4();
    const id2 = uuidv4();
    const id3 = uuidv4();
    const id4 = uuidv4();
    const id5 = uuidv4();

    // Seed dữ liệu mẫu
    const participants = [
      {
        ID: id1,
        GrammarVocab: 85,
        Reading: 90,
        Listening: 88,
        Speaking: 80,
        Writing: 75,
        Total: 418,
        Level: "B2",
        SessionID: sessionIds[0],
        approvedAt: new Date(),
        UserID: userIds[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id2,
        GrammarVocab: 70,
        Reading: 75,
        Listening: 78,
        Speaking: 85,
        Writing: 80,
        Total: 388,
        Level: "B1",
        SessionID: sessionIds[1],
        approvedAt: new Date(),
        UserID: userIds[1],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id3,
        GrammarVocab: 95,
        Reading: 92,
        Listening: 89,
        Speaking: 88,
        Writing: 90,
        Total: 454,
        Level: "C1",
        SessionID: sessionIds[2],
        approvedAt: new Date(),
        UserID: userIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id4,
        GrammarVocab: 60,
        Reading: 65,
        Listening: 70,
        Speaking: 68,
        Writing: 62,
        Total: 325,
        Level: "A2",
        SessionID: sessionIds[3],
        approvedAt: null,
        UserID: userIds[3],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id5,
        GrammarVocab: 50,
        Reading: 55,
        Listening: 60,
        Speaking: 58,
        Writing: 52,
        Total: 275,
        Level: "A1",
        SessionID: sessionIds[4],
        approvedAt: null,
        UserID: userIds[4],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("SessionParticipants", participants, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SessionParticipants", null, {});
  },
};
