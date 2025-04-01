module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("Session", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sessionKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    examSet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("NOT_STARTED", "ON_GOING", "COMPLETE"),
      defaultValue: "NOT_STARTED",
    },
    ClassID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Classes",
        key: "ID",
      },
    },
  });

  // Session.associate = function (models) {
  //   Session.belongsTo(models.Class, { foreignKey: "ClassID" });
  //   Session.hasMany(models.SessionParticipant, { foreignKey: "SessionID" });
  // };

  return Session;
};
