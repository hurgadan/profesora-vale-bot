import { DataSourceOptions } from 'typeorm';
export interface AppConfig {
    appName: string;
    recipient: string;
    telegramBotToken: string;
    databaseConnectionOptions: DataSourceOptions;
}
