"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { v4: uuidv4 } = require("uuid");
    const id1 = uuidv4();
    const id2 = uuidv4();
    const id3 = uuidv4();
    const id4 = uuidv4();
    const id5 = uuidv4();
    const id6 = uuidv4();
    const id7 = uuidv4();
    const id8 = uuidv4();
    const id9 = uuidv4();

    return queryInterface.bulkInsert("Classes", [
      {
        ID: id1,
        className: "CL0701",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id2,
        className: "CL0702",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id3,
        className: "CL0703",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id4,
        className: "CL0704",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id5,
        className: "CL0705",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id6,
        className: "CL0706",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id7,
        className: "CL0707",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id8,
        className: "CL0708",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: id9,
        className: "CL0709",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Classes", null, {});
  },
};
