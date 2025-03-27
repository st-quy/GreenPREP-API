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
    UserID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "User",
        key: "ID",
      },
    },
  });

  // SessionRequest.associate = function (models) {
  //   SessionRequest.belongsTo(models.User, { foreignKey: "StudentID" });
  //   SessionRequest.belongsTo(models.Session, { foreignKey: "SessionID" });
  // };

  return SessionRequest;
};
