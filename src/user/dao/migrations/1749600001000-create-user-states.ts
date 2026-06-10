import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateUserStates1749600001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_states",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "user_id", type: "integer", isNullable: false },
          { name: "pending_action", type: "varchar", isNullable: true },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      "user_states",
      new TableIndex({
        name: "UQ_user_states_user_id",
        columnNames: ["user_id"],
        isUnique: true,
      }),
    );
    await queryRunner.createForeignKey(
      "user_states",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "telegram_users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user_states", true);
  }
}
