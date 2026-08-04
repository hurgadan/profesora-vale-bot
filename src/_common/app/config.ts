import { AppConfig } from "../types";
import { databaseConnectionOptions } from "./database-config";
import { getEnv } from "./env";

export default (): AppConfig => ({
  appName: getEnv("APP_NAME"),
  recipient: getEnv("RECIPIENT"),
  telegramBotToken: getEnv("TELEGRAM_BOT_TOKEN"),
  databaseConnectionOptions,
});
