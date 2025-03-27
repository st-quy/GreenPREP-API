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
db.Class = require("./Class")(sequelize, DataTypes);
db.Session = require("./Session")(sequelize, DataTypes);
db.SessionParticipant = require("./SessionParticipant")(sequelize, DataTypes);
db.SessionRequest = require("./SessionRequest")(sequelize, DataTypes);

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

db.Class.hasMany(db.Session, { foreignKey: "ClassID" });

db.Session.belongsTo(db.Class, { foreignKey: "ClassID" });
db.Session.hasMany(db.SessionParticipant, { foreignKey: "SessionID" });

db.SessionParticipant.belongsTo(db.Session, { foreignKey: "SessionID" });
db.SessionParticipant.belongsTo(db.User, { foreignKey: "UserID" });

db.SessionRequest.belongsTo(db.Session, { foreignKey: "SessionID" });

module.exports = db;
