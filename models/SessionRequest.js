module.exports = (sequelize, DataTypes) => {
  const SessionRequest = sequelize.define("SessionRequest", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requestDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    SessionID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Session",
        key: "ID",
      },
    },
    UserID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "User",
        key: "ID",
      },
    },
  });

  return SessionRequest;
};
