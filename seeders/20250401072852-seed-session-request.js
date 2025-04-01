"use strict";

const { v4: uuidv4 } = require("uuid");
const { SESSION_REQUEST_STATUS } = require("../helpers/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    const sessions = await queryInterface.sequelize.query(
      `SELECT "ID" FROM "Sessions" LIMIT 5;`
    );

    const users = await queryInterface.sequelize.query(
      `SELECT "ID" FROM "Users" LIMIT 5;`
    );

    const sessionIds = sessions[0].map((session) => session.ID);
    const userIds = users[0].map((user) => user.ID);

    const id1 = uuidv4();

    const sessionRequests = [
      {
        ID: id1,
        status: SESSION_REQUEST_STATUS.PENDING,
        requestDate: new Date(),
        SessionID: sessionIds[0],
        UserID: userIds[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("SessionRequests", sessionRequests, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SessionRequests", null, {});
  },
};
