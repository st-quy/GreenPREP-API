const { v4: uuidv4 } = require('uuid'); // Import the UUID generator

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check for existing records
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM "Users" WHERE email IN ('john.doe@example.com', 'jane.smith@example.com');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingEmails = existingUsers.map(user => user.email);

    // Prepare data to insert, excluding duplicates
    const usersToInsert = [
      {
        ID: uuidv4(),
        lastName: 'Doe',
        firstName: 'John',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        studentCode: 'S123456',
        teacherCode: 'T123456',
        roleIDs: ['student'],
        password: 'hashed_password_1',
        status: true,
        address: '123 Main St, Anytown, USA',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ID: uuidv4(),
        lastName: 'Smith',
        firstName: 'Jane',
        email: 'jane.smith@example.com',
        phone: '098-765-4321',
        studentCode: 'S654321',
        teacherCode: 'T654321',
        roleIDs: ['teacher'],
        password: 'hashed_password_2',
        status: true,
        address: '456 Elm St, Othertown, USA',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].filter(user => !existingEmails.includes(user.email)); // Exclude duplicates

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('Users', usersToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};