// models/User.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      ID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // Nullable
      },
      studentCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // Nullable
      },
      teacherCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // Nullable
      },
      roleIDs: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: ["student"], // Default value
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      class: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable
      },
    },
    {
      getterMethods: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    }
  );

  return User;
};
