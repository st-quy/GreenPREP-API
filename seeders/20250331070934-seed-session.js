"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { v4: uuidv4 } = require("uuid");

    // Fetch existing Class IDs from the database
    const classes = await queryInterface.sequelize.query(
      `SELECT "ID" FROM "Classes";`
    );

    const classIds = classes[0].map((c) => c.ID);

    return queryInterface.bulkInsert("Sessions", [
      {
        ID: uuidv4(),
        sessionName: "Session 1",
        sessionKey: "S1-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 3600000),
        examSet: "ExamSetA",
        status: "NOT_STARTED",
        ClassID: classIds[0], // Assign first class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        sessionName: "Session 2",
        sessionKey: "S2-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 7200000),
        examSet: "ExamSetB",
        status: "ON_GOING",
        ClassID: classIds[1], // Assign second class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        sessionName: "Session 3",
        sessionKey: "S3-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 5400000), // +1.5 hours
        examSet: "ExamSetC",
        status: "COMPLETE",
        ClassID: classIds[2], // Assign third class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        sessionName: "Session 4",
        sessionKey: "S4-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 3600000),
        examSet: "ExamSetA",
        status: "NOT_STARTED",
        ClassID: classIds[0], // Assign first class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        sessionName: "Session 5",
        sessionKey: "S5-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 7200000),
        examSet: "ExamSetB",
        status: "ON_GOING",
        ClassID: classIds[1], // Assign second class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        sessionName: "Session 6",
        sessionKey: "S6-KEY",
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 5400000), // +1.5 hours
        examSet: "ExamSetC",
        status: "COMPLETE",
        ClassID: classIds[2], // Assign third class
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Sessions", null, {});
  },
};
