// models/index.js
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.User = require("./User")(sequelize, DataTypes);
db.Role = require("./Role")(sequelize, DataTypes);
db.UserRole = require("./UserRole")(sequelize, DataTypes);
db.Topic = require("./Topic")(sequelize, DataTypes);
db.Part = require("./Part")(sequelize, DataTypes);
db.Question = require("./Question")(sequelize, DataTypes);
db.StudentAnswer = require("./StudentAnswer")(sequelize, DataTypes);
db.Skill = require("./Skill")(sequelize, DataTypes);

// Relationships
db.User.belongsToMany(db.Role, { through: db.UserRole, foreignKey: "UserID" });
db.Role.belongsToMany(db.User, { through: db.UserRole, foreignKey: "RoleID" });

db.Topic.hasMany(db.Part, { foreignKey: "TopicID" });
db.Part.belongsTo(db.Topic, { foreignKey: "TopicID" });

db.Part.hasMany(db.Question, { foreignKey: "PartID" });
db.Question.belongsTo(db.Part, { foreignKey: "PartID" });

db.Question.belongsTo(db.Skill, { foreignKey: "SkillID" });

db.StudentAnswer.belongsTo(db.User, { foreignKey: "StudentID" });
db.StudentAnswer.belongsTo(db.Topic, { foreignKey: "TopicID" });
db.StudentAnswer.belongsTo(db.Question, { foreignKey: "QuestionID" });

module.exports = db;
