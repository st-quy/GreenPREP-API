module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define("Class", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Class.associate = function (models) {
  //   Class.hasMany(models.Session, { foreignKey: "ClassID" });
  //   Class.hasMany(models.User, { foreignKey: "ClassID" });
  // };

  return Class;
};
