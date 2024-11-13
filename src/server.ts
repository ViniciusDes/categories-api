process.env.TZ = "UTC";
require("dotenv").config();
require("express-async-errors");
import "reflect-metadata";
import "./shared/container";
import express from "express";
import AppDataSource from "./infra/database/data-source";
import bodyParser from "body-parser";
import makeSetupSwagger from "./swagger-setup";
import { router as routes } from "./routes/index";
import ErrorHandler from "./middlewares/error-handler";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(routes);
app.use(ErrorHandler);
makeSetupSwagger(app);

AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  })
  .catch((error: Error) =>
    console.error("Erro ao conectar ao banco de dados:", error)
  );
app.listen(3334, () => console.log("server running"));
