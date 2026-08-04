import * as path from "node:path";

import { DataSource } from "typeorm";

import { databaseConnectionOptions } from "../_common/app/database-config";

export const AppDataSource = new DataSource({
  ...databaseConnectionOptions,
  entities: [path.join(__dirname, "..", "**", "*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "..", "**", "migrations", "*{.ts,.js}")],
  migrationsTableName: "migrations",
});
