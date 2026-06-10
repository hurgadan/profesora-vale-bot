import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTelegramUsers1749600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "telegram_users",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "telegram_id", type: "bigint", isNullable: false },
          { name: "first_name", type: "varchar", isNullable: false },
          { name: "last_name", type: "varchar", isNullable: true },
          { name: "username", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      "telegram_users",
      new TableIndex({
        name: "UQ_telegram_users_telegram_id",
        columnNames: ["telegram_id"],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("telegram_users", true);
  }
}
