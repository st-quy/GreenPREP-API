module.exports = (sequelize, DataTypes) => {
  const SessionParticipant = sequelize.define("SessionParticipant", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    GrammarVocab: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Reading: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Listening: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Speaking: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Writing: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Level: {
      type: DataTypes.ENUM("A1", "A2", "B1", "B2", "C1", "C2"),
      allowNull: true,
    },
    SessionID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Session",
        key: "ID",
      },
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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

  // SessionParticipant.associate = function (models) {
  //   SessionParticipant.belongsTo(models.Session, { foreignKey: "SessionID" });
  //   SessionParticipant.belongsTo(models.User, { foreignKey: "UserID" });
  // };

  return SessionParticipant;
};
