/**@type {import('./index').Modeling} */
module.exports = (sequelize, DataTypes) => {
  const SessionParticipant = sequelize.define("SessionParticipant", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    GrammarVocab: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Reading: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Listening: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Speaking: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Writing: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Total: {
      type: DataTypes.FLOAT,
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
        model: "Sessions",
        key: "ID",
      },
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
        model: "Users",
        key: "ID",
      },
    },
  });

  return SessionParticipant;
};
