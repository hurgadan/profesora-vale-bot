import { DataSourceOptions } from "typeorm";

import { getEnv, getEnvBoolean, getEnvNumber } from "./env";

export const databaseConnectionOptions: DataSourceOptions = {
  type: "postgres",
  host: getEnv("DB_HOST"),
  port: getEnvNumber("DB_PORT"),
  username: getEnv("DB_LOGIN"),
  password: getEnv("DB_PASSWORD"),
  database: getEnv("DB_NAME"),
  logging: getEnvBoolean("DB_ENABLE_LOGGING"),
  synchronize: false,
};
