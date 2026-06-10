import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBotEvents1749600002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bot_events',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'action', type: 'varchar', isNullable: false },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'bot_events',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'telegram_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bot_events', true, true);
  }
}
