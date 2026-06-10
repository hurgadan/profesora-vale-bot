"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBotEvents1749600002000 = void 0;
const typeorm_1 = require("typeorm");
class CreateBotEvents1749600002000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'bot_events',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'user_id', type: 'integer', isNullable: false },
                { name: 'action', type: 'varchar', isNullable: false },
                { name: 'payload', type: 'text', isNullable: true },
                { name: 'created_at', type: 'timestamp', default: 'now()' },
            ],
        }), true);
        await queryRunner.createForeignKey('bot_events', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'telegram_users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('bot_events', true, true);
    }
}
exports.CreateBotEvents1749600002000 = CreateBotEvents1749600002000;
//# sourceMappingURL=1749600002000-create-bot-events.js.map