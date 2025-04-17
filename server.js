// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
const app = express();
const { swaggerUi, swaggerSpec } = require("./swagger");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", require("./routes"));

db.sequelize
  // .sync({force: true})
  .authenticate()
  .then(async () => {
    console.log("Database synchronized and models updated successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error synchronizing the database:", error);
  });
