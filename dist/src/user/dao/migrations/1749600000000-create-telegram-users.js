"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTelegramUsers1749600000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateTelegramUsers1749600000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'telegram_users',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'telegram_id', type: 'bigint', isNullable: false },
                { name: 'first_name', type: 'varchar', isNullable: false },
                { name: 'last_name', type: 'varchar', isNullable: true },
                { name: 'username', type: 'varchar', isNullable: true },
                { name: 'created_at', type: 'timestamp', default: 'now()' },
                { name: 'updated_at', type: 'timestamp', default: 'now()' },
            ],
        }), true);
        await queryRunner.createIndex('telegram_users', new typeorm_1.TableIndex({ name: 'UQ_telegram_users_telegram_id', columnNames: ['telegram_id'], isUnique: true }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('telegram_users', true);
    }
}
exports.CreateTelegramUsers1749600000000 = CreateTelegramUsers1749600000000;
//# sourceMappingURL=1749600000000-create-telegram-users.js.map