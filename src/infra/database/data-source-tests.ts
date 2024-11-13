import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export function getConfig() {
  return {
    type: "postgres",
    host: process.env.HOST_DB_BY_CONTAINER,
    port: process.env.PORT_DB_BY_CONTAINER,
    poolSize: 3,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    synchronize: true,
    logging: false,
    entities: ["src/infra/database/entities/*.ts"],
    migrations: ["src/infra/database/migrations/*.ts"],
    subscribers: [],
  } as DataSourceOptions;
}

export default new DataSource(getConfig());
